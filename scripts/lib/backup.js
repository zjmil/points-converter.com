/**
 * Backup and rollback system for conversions data
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

class BackupManager {
  constructor(dataPath, backupDir = null) {
    this.dataPath = dataPath;
    this.backupDir = backupDir || path.join(path.dirname(dataPath), 'backups');
    this.maxBackups = 50; // Keep last 50 backups
    
    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Create a backup of the current data
   */
  createBackup(reason = 'manual') {
    try {
      const data = fs.readFileSync(this.dataPath, 'utf8');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const hash = crypto.createHash('md5').update(data).digest('hex').substring(0, 8);
      
      const backupFilename = `conversions_${timestamp}_${hash}.json`;
      const backupPath = path.join(this.backupDir, backupFilename);
      
      const backupData = {
        timestamp: new Date().toISOString(),
        reason,
        hash,
        originalPath: this.dataPath,
        data: JSON.parse(data)
      };
      
      fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
      
      // Clean up old backups
      this.cleanupOldBackups();
      
      return {
        success: true,
        backupPath,
        filename: backupFilename,
        hash,
        size: fs.statSync(backupPath).size
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * List all available backups
   */
  listBackups() {
    try {
      const files = fs.readdirSync(this.backupDir)
        .filter(file => file.startsWith('conversions_') && file.endsWith('.json'))
        .map(file => {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);
          
          try {
            const backupData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            return {
              filename: file,
              timestamp: backupData.timestamp,
              reason: backupData.reason || 'unknown',
              hash: backupData.hash,
              size: stats.size,
              age: Date.now() - new Date(backupData.timestamp).getTime(),
              path: filePath
            };
          } catch (parseError) {
            // Handle legacy backups without metadata
            return {
              filename: file,
              timestamp: stats.mtime.toISOString(),
              reason: 'legacy',
              hash: 'unknown',
              size: stats.size,
              age: Date.now() - stats.mtime.getTime(),
              path: filePath
            };
          }
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      return files;
    } catch (error) {
      return [];
    }
  }

  /**
   * Restore from a backup
   */
  restoreBackup(backupFilename) {
    try {
      const backupPath = path.join(this.backupDir, backupFilename);
      
      if (!fs.existsSync(backupPath)) {
        return {
          success: false,
          error: 'Backup file not found'
        };
      }
      
      // Create a backup of current state before restoring
      const currentBackup = this.createBackup('pre-restore');
      
      const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      
      // Extract the actual data
      const dataToRestore = backupData.data || backupData; // Handle both new and legacy formats
      
      // Restore the data
      fs.writeFileSync(this.dataPath, JSON.stringify(dataToRestore, null, 2));
      
      return {
        success: true,
        restoredFrom: backupFilename,
        currentBackup: currentBackup.filename,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Compare current data with a backup
   */
  compareWithBackup(backupFilename) {
    try {
      const backupPath = path.join(this.backupDir, backupFilename);
      const currentData = JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
      const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      
      const backup = backupData.data || backupData; // Handle both formats
      
      const differences = {
        programs: this.compareObjects(currentData.programs, backup.programs),
        conversions: this.compareArrays(currentData.conversions, backup.conversions),
        config: this.compareObjects(currentData.config, backup.config),
        affiliateLinks: this.compareArrays(currentData.affiliateLinks, backup.affiliateLinks)
      };
      
      const totalChanges = Object.values(differences).reduce((sum, diff) => 
        sum + (diff.added?.length || 0) + (diff.removed?.length || 0) + (diff.modified?.length || 0), 0);
      
      return {
        success: true,
        differences,
        totalChanges,
        summary: this.generateComparisonSummary(differences)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Clean up old backups keeping only the most recent ones
   */
  cleanupOldBackups() {
    const backups = this.listBackups();
    
    if (backups.length > this.maxBackups) {
      const toDelete = backups.slice(this.maxBackups);
      
      toDelete.forEach(backup => {
        try {
          fs.unlinkSync(backup.path);
        } catch (error) {
          console.warn(`Failed to delete old backup ${backup.filename}: ${error.message}`);
        }
      });
      
      return toDelete.length;
    }
    
    return 0;
  }

  /**
   * Auto-backup before any data modification
   */
  autoBackup(operation) {
    return this.createBackup(`auto-${operation}`);
  }

  /**
   * Verify backup integrity
   */
  verifyBackup(backupFilename) {
    try {
      const backupPath = path.join(this.backupDir, backupFilename);
      const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      
      const data = backupData.data || backupData;
      
      // Basic structure validation
      const hasRequiredFields = data.programs && data.conversions && data.lastUpdated;
      
      // Hash verification (if available)
      let hashValid = true;
      if (backupData.hash) {
        const currentHash = crypto.createHash('md5')
          .update(JSON.stringify(data))
          .digest('hex')
          .substring(0, 8);
        hashValid = currentHash === backupData.hash;
      }
      
      return {
        valid: hasRequiredFields && hashValid,
        hasRequiredFields,
        hashValid,
        size: fs.statSync(backupPath).size,
        programCount: Object.keys(data.programs || {}).length,
        conversionCount: (data.conversions || []).length
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Compare two objects and return differences
   */
  compareObjects(current, backup) {
    const currentKeys = new Set(Object.keys(current || {}));
    const backupKeys = new Set(Object.keys(backup || {}));
    
    const added = [...currentKeys].filter(key => !backupKeys.has(key));
    const removed = [...backupKeys].filter(key => !currentKeys.has(key));
    const modified = [];
    
    [...currentKeys].filter(key => backupKeys.has(key)).forEach(key => {
      if (JSON.stringify(current[key]) !== JSON.stringify(backup[key])) {
        modified.push({
          key,
          current: current[key],
          backup: backup[key]
        });
      }
    });
    
    return { added, removed, modified };
  }

  /**
   * Compare two arrays and return differences
   */
  compareArrays(current, backup) {
    const currentItems = current || [];
    const backupItems = backup || [];
    
    // For conversions, use from+to as identifier
    const getId = (item) => item.from && item.to ? `${item.from}->${item.to}` : JSON.stringify(item);
    
    const currentMap = new Map(currentItems.map(item => [getId(item), item]));
    const backupMap = new Map(backupItems.map(item => [getId(item), item]));
    
    const added = [...currentMap.keys()].filter(id => !backupMap.has(id)).map(id => currentMap.get(id));
    const removed = [...backupMap.keys()].filter(id => !currentMap.has(id)).map(id => backupMap.get(id));
    const modified = [];
    
    [...currentMap.keys()].filter(id => backupMap.has(id)).forEach(id => {
      const current = currentMap.get(id);
      const backup = backupMap.get(id);
      
      if (JSON.stringify(current) !== JSON.stringify(backup)) {
        modified.push({
          id,
          current,
          backup
        });
      }
    });
    
    return { added, removed, modified };
  }

  /**
   * Generate a human-readable comparison summary
   */
  generateComparisonSummary(differences) {
    const summary = [];
    
    Object.entries(differences).forEach(([section, diff]) => {
      if (diff.added?.length) {
        summary.push(`${diff.added.length} ${section} added`);
      }
      if (diff.removed?.length) {
        summary.push(`${diff.removed.length} ${section} removed`);
      }
      if (diff.modified?.length) {
        summary.push(`${diff.modified.length} ${section} modified`);
      }
    });
    
    return summary.length ? summary.join(', ') : 'No changes detected';
  }

  /**
   * Get backup statistics
   */
  getStats() {
    const backups = this.listBackups();
    const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
    
    return {
      totalBackups: backups.length,
      totalSize,
      averageSize: backups.length ? Math.round(totalSize / backups.length) : 0,
      oldestBackup: backups.length ? backups[backups.length - 1].timestamp : null,
      newestBackup: backups.length ? backups[0].timestamp : null,
      backupDir: this.backupDir
    };
  }
}

export default BackupManager;