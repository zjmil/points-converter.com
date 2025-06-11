#!/usr/bin/env node

/**
 * Enhanced conversion data management tool
 * Combines validation, scraping, backup, and interactive management
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import DataValidator from './lib/validator.js';
import DataScraper from './lib/scraper.js';
import BackupManager from './lib/backup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const conversionsPath = path.join(__dirname, '../public/data/conversions.json');

class ConversionManager {
  constructor() {
    this.dataPath = conversionsPath;
    this.validator = new DataValidator();
    this.scraper = new DataScraper();
    this.backup = new BackupManager(conversionsPath);
    
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.loadData();
  }

  loadData() {
    try {
      this.data = JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
    } catch (error) {
      console.error('❌ Failed to load data:', error.message);
      process.exit(1);
    }
  }

  async run() {
    console.log('🎯 Points Converter Management Tool');
    console.log('=====================================\n');
    
    // Auto-validate on startup
    await this.validateData(false);
    
    while (true) {
      console.log('\n📋 Available Actions:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔍 Data Management:');
      console.log('  1. Validate data integrity');
      console.log('  2. Auto-repair data issues');
      console.log('  3. View detailed validation report');
      console.log('\n📥 Data Updates:');
      console.log('  4. Scrape and update from URLs');
      console.log('  5. Manual conversion updates');
      console.log('  6. Add new program');
      console.log('  7. Add new conversion');
      console.log('\n💾 Backup & Recovery:');
      console.log('  8. Create backup');
      console.log('  9. List backups');
      console.log('  10. Restore from backup');
      console.log('  11. Compare with backup');
      console.log('\n📊 Information:');
      console.log('  12. Show statistics');
      console.log('  13. List all conversions');
      console.log('  14. Search conversions');
      console.log('\n💿 File Operations:');
      console.log('  15. Export data');
      console.log('  16. Split data files');
      console.log('\n🔄 System:');
      console.log('  17. Save and exit');
      console.log('  18. Exit without saving');
      
      const choice = await this.ask('\n🎮 Select action (1-18): ');
      
      try {
        switch (choice) {
          case '1': await this.validateData(); break;
          case '2': await this.autoRepairData(); break;
          case '3': await this.showDetailedReport(); break;
          case '4': await this.scrapeAndUpdate(); break;
          case '5': await this.manualUpdate(); break;
          case '6': await this.addProgram(); break;
          case '7': await this.addConversion(); break;
          case '8': await this.createBackup(); break;
          case '9': await this.listBackups(); break;
          case '10': await this.restoreBackup(); break;
          case '11': await this.compareBackup(); break;
          case '12': await this.showStatistics(); break;
          case '13': await this.listConversions(); break;
          case '14': await this.searchConversions(); break;
          case '15': await this.exportData(); break;
          case '16': await this.splitDataFiles(); break;
          case '17': 
            await this.saveData();
            this.rl.close();
            return;
          case '18':
            console.log('👋 Exiting without saving...');
            this.rl.close();
            return;
          default:
            console.log('❌ Invalid choice. Please try again.');
        }
      } catch (error) {
        console.error('❌ Error:', error.message);
      }
    }
  }

  async validateData(showDetails = true) {
    console.log('\n🔍 Validating data...');
    
    const report = this.validator.generateReport(this.data);
    
    if (report.summary.valid) {
      console.log('✅ Data validation passed!');
    } else {
      console.log(`❌ Found ${report.summary.totalIssues} issues`);
      
      if (showDetails) {
        if (report.schemaValidation.errors.length > 0) {
          console.log('\n📋 Schema Validation Errors:');
          report.schemaValidation.errors.forEach(error => {
            console.log(`  • ${error.instancePath}: ${error.message}`);
          });
        }
        
        if (report.integrityCheck.issues.length > 0) {
          console.log('\n🔗 Referential Integrity Issues:');
          report.integrityCheck.issues.forEach(issue => {
            console.log(`  • ${issue.type}: ${issue.message}`);
          });
        }
      }
    }
    
    return report;
  }

  async autoRepairData() {
    console.log('\n🔧 Auto-repairing data issues...');
    
    // Create backup first
    const backupResult = this.backup.autoBackup('repair');
    if (backupResult.success) {
      console.log(`💾 Backup created: ${backupResult.filename}`);
    }
    
    const repair = this.validator.autoRepair(this.data);
    
    if (repair.repairCount > 0) {
      console.log(`✅ Fixed ${repair.repairCount} issues:`);
      repair.repairs.forEach(repair => console.log(`  • ${repair}`));
      this.data = repair.data;
    } else {
      console.log('✨ No issues found to repair');
    }
  }

  async showDetailedReport() {
    const report = this.validator.generateReport(this.data);
    
    console.log('\n📊 Detailed Validation Report');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🕐 Generated: ${report.timestamp}`);
    console.log(`📈 Total Programs: ${report.integrityCheck.stats.totalPrograms}`);
    console.log(`🔄 Total Conversions: ${report.integrityCheck.stats.totalConversions}`);
    console.log(`⚠️  Issues Found: ${report.summary.totalIssues}`);
    console.log(`🚨 Critical Issues: ${report.summary.criticalIssues}`);
    console.log(`⚡ Warnings: ${report.summary.warnings}`);
    
    if (report.integrityCheck.orphanedConversions.length > 0) {
      console.log('\n🔗 Orphaned Conversions:');
      report.integrityCheck.orphanedConversions.forEach(orphan => {
        console.log(`  • ${orphan.issue}`);
      });
    }
    
    if (report.integrityCheck.missingPrograms.length > 0) {
      console.log('\n❓ Missing Programs:');
      report.integrityCheck.missingPrograms.forEach(program => {
        console.log(`  • ${program}`);
      });
    }
  }

  async scrapeAndUpdate() {
    console.log('\n🌐 Scraping data from URLs...');
    console.log('⚠️  Note: This is a demo - actual scraping requires HTTP client setup');
    
    const programs = ['chase_ur', 'amex_mr', 'citi_typ'];
    
    for (const program of programs) {
      try {
        console.log(`\n📡 Would scrape ${program}...`);
        // Simulate scraping results
        console.log(`✅ ${program}: Found 15 transfer partners`);
        console.log(`🔄 ${program}: 3 rates updated, 1 bonus added`);
      } catch (error) {
        console.log(`❌ ${program}: ${error.message}`);
      }
    }
    
    console.log('\n💡 To enable actual scraping:');
    console.log('   1. Install HTTP client (axios, node-fetch)');
    console.log('   2. Configure scraping selectors in config/scraping-configs.json');
    console.log('   3. Implement rate limiting and error handling');
  }

  async manualUpdate() {
    await this.listConversions(true);
    const index = await this.ask('\n🎯 Enter conversion number to update: ');
    const convIndex = parseInt(index) - 1;
    
    if (convIndex < 0 || convIndex >= this.data.conversions.length) {
      console.log('❌ Invalid conversion number');
      return;
    }
    
    const conv = this.data.conversions[convIndex];
    const fromName = this.data.programs[conv.from]?.name || conv.from;
    const toName = this.data.programs[conv.to]?.name || conv.to;
    
    console.log(`\n📝 Updating: ${fromName} → ${toName}`);
    console.log(`Current rate: 1:${conv.rate}`);
    
    const newRate = await this.ask('🔢 Enter new rate (or press enter to skip): ');
    if (newRate.trim()) {
      const parsedRate = parseFloat(newRate);
      if (!isNaN(parsedRate) && parsedRate > 0) {
        conv.rate = parsedRate;
        console.log(`✅ Rate updated to 1:${parsedRate}`);
      } else {
        console.log('❌ Invalid rate');
        return;
      }
    }
    
    const hasBonus = await this.ask('🎁 Has bonus? (y/n/skip): ');
    if (hasBonus.toLowerCase() === 'y') {
      const bonusRate = await this.ask('💰 Enter bonus rate: ');
      const parsedBonus = parseFloat(bonusRate);
      if (!isNaN(parsedBonus) && parsedBonus > 0) {
        conv.bonus = true;
        conv.bonusRate = parsedBonus;
        
        const endDate = await this.ask('📅 Bonus end date (YYYY-MM-DD, optional): ');
        if (endDate.trim()) {
          conv.bonusEndDate = new Date(endDate + 'T23:59:59Z').toISOString();
        }
      }
    } else if (hasBonus.toLowerCase() === 'n') {
      conv.bonus = false;
      conv.bonusRate = null;
      delete conv.bonusEndDate;
    }
    
    conv.lastUpdated = new Date().toISOString();
    console.log('✅ Conversion updated');
  }

  async addProgram() {
    console.log('\n➕ Adding new program');
    
    const id = await this.ask('🔑 Program ID (lowercase_with_underscores): ');
    
    if (this.data.programs[id]) {
      console.log('❌ Program ID already exists');
      return;
    }
    
    const name = await this.ask('📛 Program name: ');
    const shortName = await this.ask('🏷️  Short name: ');
    const type = await this.ask('🏢 Type (bank/airline/hotel/retail): ');
    const dollarValue = await this.ask('💵 Dollar value per point: ');
    
    const parsedValue = parseFloat(dollarValue);
    if (isNaN(parsedValue) || parsedValue <= 0) {
      console.log('❌ Invalid dollar value');
      return;
    }
    
    this.data.programs[id] = {
      name,
      shortName,
      type,
      dollarValue: parsedValue
    };
    
    console.log(`✅ Program ${name} added with ID: ${id}`);
  }

  async addConversion() {
    console.log('\n➕ Adding new conversion');
    
    this.showPrograms();
    
    const from = await this.ask('📤 FROM program ID: ');
    const to = await this.ask('📥 TO program ID: ');
    
    if (!this.data.programs[from] || !this.data.programs[to]) {
      console.log('❌ Invalid program ID(s)');
      return;
    }
    
    // Check for existing conversion
    const existing = this.data.conversions.find(c => c.from === from && c.to === to);
    if (existing) {
      console.log('⚠️  Conversion already exists');
      return;
    }
    
    const rate = await this.ask('🔢 Transfer rate: ');
    const parsedRate = parseFloat(rate);
    
    if (isNaN(parsedRate) || parsedRate <= 0) {
      console.log('❌ Invalid rate');
      return;
    }
    
    const instant = await this.ask('⚡ Instant transfer? (y/n): ');
    const minAmount = await this.ask('💰 Minimum amount (or 0): ');
    const source = await this.ask('🔗 Source URL (optional): ');
    
    const newConversion = {
      from,
      to,
      rate: parsedRate,
      bonus: false,
      bonusRate: null,
      instantTransfer: instant.toLowerCase() === 'y',
      lastUpdated: new Date().toISOString()
    };
    
    const parsedMin = parseInt(minAmount);
    if (parsedMin > 0) {
      newConversion.minAmount = parsedMin;
    }
    
    if (source.trim()) {
      newConversion.source = source.trim();
    }
    
    this.data.conversions.push(newConversion);
    console.log('✅ Conversion added');
  }

  async createBackup() {
    const reason = await this.ask('📝 Backup reason (optional): ');
    const result = this.backup.createBackup(reason || 'manual');
    
    if (result.success) {
      console.log(`✅ Backup created: ${result.filename}`);
      console.log(`💾 Size: ${Math.round(result.size / 1024)}KB`);
      console.log(`🔑 Hash: ${result.hash}`);
    } else {
      console.log(`❌ Backup failed: ${result.error}`);
    }
  }

  async listBackups() {
    const backups = this.backup.listBackups();
    
    if (backups.length === 0) {
      console.log('📭 No backups found');
      return;
    }
    
    console.log('\n📦 Available Backups:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    backups.forEach((backup, index) => {
      const age = Math.round(backup.age / (1000 * 60 * 60 * 24));
      const size = Math.round(backup.size / 1024);
      
      console.log(`${index + 1}. ${backup.filename}`);
      console.log(`   📅 ${new Date(backup.timestamp).toLocaleString()}`);
      console.log(`   📝 ${backup.reason} | 💾 ${size}KB | 🕐 ${age} days ago`);
      console.log('');
    });
  }

  async restoreBackup() {
    await this.listBackups();
    
    const choice = await this.ask('🔄 Enter backup number to restore: ');
    const backups = this.backup.listBackups();
    const index = parseInt(choice) - 1;
    
    if (index < 0 || index >= backups.length) {
      console.log('❌ Invalid backup number');
      return;
    }
    
    const backup = backups[index];
    const confirm = await this.ask(`⚠️  Restore from ${backup.filename}? (y/N): `);
    
    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ Restore cancelled');
      return;
    }
    
    const result = this.backup.restoreBackup(backup.filename);
    
    if (result.success) {
      console.log(`✅ Restored from ${result.restoredFrom}`);
      console.log(`💾 Current state backed up as: ${result.currentBackup}`);
      this.loadData(); // Reload data
    } else {
      console.log(`❌ Restore failed: ${result.error}`);
    }
  }

  async compareBackup() {
    await this.listBackups();
    
    const choice = await this.ask('📊 Enter backup number to compare: ');
    const backups = this.backup.listBackups();
    const index = parseInt(choice) - 1;
    
    if (index < 0 || index >= backups.length) {
      console.log('❌ Invalid backup number');
      return;
    }
    
    const backup = backups[index];
    const result = this.backup.compareWithBackup(backup.filename);
    
    if (result.success) {
      console.log(`\n📊 Comparison with ${backup.filename}:`);
      console.log(`🔢 Total changes: ${result.totalChanges}`);
      console.log(`📝 Summary: ${result.summary}`);
      
      if (result.totalChanges > 0) {
        const details = await this.ask('📋 Show detailed differences? (y/n): ');
        if (details.toLowerCase() === 'y') {
          console.log('\n📋 Detailed Differences:');
          Object.entries(result.differences).forEach(([section, diff]) => {
            if (diff.added?.length || diff.removed?.length || diff.modified?.length) {
              console.log(`\n${section.toUpperCase()}:`);
              if (diff.added?.length) console.log(`  ➕ ${diff.added.length} added`);
              if (diff.removed?.length) console.log(`  ➖ ${diff.removed.length} removed`);
              if (diff.modified?.length) console.log(`  🔄 ${diff.modified.length} modified`);
            }
          });
        }
      }
    } else {
      console.log(`❌ Comparison failed: ${result.error}`);
    }
  }

  async showStatistics() {
    const stats = this.calculateStatistics();
    const backupStats = this.backup.getStats();
    
    console.log('\n📊 Data Statistics');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📈 Programs: ${stats.totalPrograms}`);
    console.log(`  🏦 Banks: ${stats.programsByType.bank || 0}`);
    console.log(`  ✈️  Airlines: ${stats.programsByType.airline || 0}`);
    console.log(`  🏨 Hotels: ${stats.programsByType.hotel || 0}`);
    console.log(`  🛒 Retail: ${stats.programsByType.retail || 0}`);
    
    console.log(`\n🔄 Conversions: ${stats.totalConversions}`);
    console.log(`  ⚡ Instant: ${stats.instantTransfers}`);
    console.log(`  🎁 With Bonus: ${stats.bonusConversions}`);
    console.log(`  📊 Avg Rate: ${stats.averageRate.toFixed(3)}`);
    
    console.log(`\n💾 Backups: ${backupStats.totalBackups}`);
    console.log(`  📦 Total Size: ${Math.round(backupStats.totalSize / 1024)}KB`);
    console.log(`  📅 Oldest: ${backupStats.oldestBackup ? new Date(backupStats.oldestBackup).toLocaleDateString() : 'None'}`);
    
    console.log(`\n🕐 Last Updated: ${new Date(this.data.lastUpdated).toLocaleString()}`);
    console.log(`📍 Data Source: ${this.data.dataSource}`);
  }

  async listConversions(numbered = false) {
    console.log('\n🔄 Current Conversions:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    this.data.conversions.forEach((conv, index) => {
      const fromName = this.data.programs[conv.from]?.shortName || conv.from;
      const toName = this.data.programs[conv.to]?.shortName || conv.to;
      const rate = conv.bonus ? `${conv.rate} (🎁${conv.bonusRate})` : conv.rate;
      const instant = conv.instantTransfer ? '⚡' : '⏳';
      const prefix = numbered ? `${(index + 1).toString().padStart(2)}.` : '  •';
      
      console.log(`${prefix} ${fromName} → ${toName} | 1:${rate} ${instant}`);
    });
  }

  async searchConversions() {
    const query = await this.ask('🔍 Search conversions (program name or ID): ');
    const searchTerm = query.toLowerCase().trim();
    
    const matches = this.data.conversions.filter(conv => {
      const fromProgram = this.data.programs[conv.from];
      const toProgram = this.data.programs[conv.to];
      
      return conv.from.includes(searchTerm) || 
             conv.to.includes(searchTerm) ||
             fromProgram?.name.toLowerCase().includes(searchTerm) ||
             toProgram?.name.toLowerCase().includes(searchTerm) ||
             fromProgram?.shortName.toLowerCase().includes(searchTerm) ||
             toProgram?.shortName.toLowerCase().includes(searchTerm);
    });
    
    if (matches.length === 0) {
      console.log('❌ No matching conversions found');
      return;
    }
    
    console.log(`\n🎯 Found ${matches.length} matching conversions:`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    matches.forEach(conv => {
      const fromName = this.data.programs[conv.from]?.name || conv.from;
      const toName = this.data.programs[conv.to]?.name || conv.to;
      const rate = conv.bonus ? `${conv.rate} (🎁${conv.bonusRate})` : conv.rate;
      
      console.log(`  • ${fromName} → ${toName}`);
      console.log(`    Rate: 1:${rate} | Updated: ${new Date(conv.lastUpdated).toLocaleDateString()}`);
      if (conv.note) console.log(`    Note: ${conv.note}`);
      console.log('');
    });
  }

  async exportData() {
    console.log('\n📤 Export Options:');
    console.log('  1. Full JSON export');
    console.log('  2. Programs only');
    console.log('  3. Conversions only');
    console.log('  4. CSV format');
    
    const choice = await this.ask('📋 Select export type (1-4): ');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    let filename, data, format = 'json';
    
    switch (choice) {
      case '1':
        filename = `conversions-full-${timestamp}.json`;
        data = this.data;
        break;
      case '2':
        filename = `programs-${timestamp}.json`;
        data = { programs: this.data.programs };
        break;
      case '3':
        filename = `conversions-${timestamp}.json`;
        data = { conversions: this.data.conversions };
        break;
      case '4':
        filename = `conversions-${timestamp}.csv`;
        format = 'csv';
        data = this.convertToCSV();
        break;
      default:
        console.log('❌ Invalid choice');
        return;
    }
    
    const exportPath = path.join(__dirname, '../exports');
    if (!fs.existsSync(exportPath)) {
      fs.mkdirSync(exportPath, { recursive: true });
    }
    
    const filepath = path.join(exportPath, filename);
    
    if (format === 'json') {
      fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    } else {
      fs.writeFileSync(filepath, data);
    }
    
    console.log(`✅ Exported to: ${filepath}`);
  }

  async splitDataFiles() {
    console.log('\n📁 Splitting data into separate files...');
    
    const outputDir = path.join(__dirname, '../public/data/split');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Split into separate files
    const files = {
      'programs.json': { programs: this.data.programs },
      'conversions.json': { conversions: this.data.conversions },
      'config.json': { 
        config: this.data.config,
        lastUpdated: this.data.lastUpdated,
        dataSource: this.data.dataSource
      },
      'affiliate-links.json': { affiliateLinks: this.data.affiliateLinks || [] }
    };
    
    Object.entries(files).forEach(([filename, data]) => {
      const filepath = path.join(outputDir, filename);
      fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
      console.log(`✅ Created: ${filename}`);
    });
    
    // Create index file that references all parts
    const index = {
      version: '1.0.0',
      split: true,
      files: Object.keys(files),
      lastGenerated: new Date().toISOString()
    };
    
    fs.writeFileSync(path.join(outputDir, 'index.json'), JSON.stringify(index, null, 2));
    console.log(`✅ Created: index.json`);
    console.log(`📁 All files saved to: ${outputDir}`);
  }

  showPrograms() {
    console.log('\n📋 Available Programs:');
    Object.entries(this.data.programs).forEach(([id, program]) => {
      console.log(`  ${id}: ${program.name} (${program.shortName})`);
    });
  }

  calculateStatistics() {
    const programs = this.data.programs || {};
    const conversions = this.data.conversions || [];
    
    const programsByType = {};
    Object.values(programs).forEach(program => {
      programsByType[program.type] = (programsByType[program.type] || 0) + 1;
    });
    
    const instantTransfers = conversions.filter(c => c.instantTransfer).length;
    const bonusConversions = conversions.filter(c => c.bonus).length;
    const totalRate = conversions.reduce((sum, c) => sum + c.rate, 0);
    const averageRate = conversions.length ? totalRate / conversions.length : 0;
    
    return {
      totalPrograms: Object.keys(programs).length,
      programsByType,
      totalConversions: conversions.length,
      instantTransfers,
      bonusConversions,
      averageRate
    };
  }

  convertToCSV() {
    const headers = 'From,To,Rate,Bonus,BonusRate,InstantTransfer,MinAmount,LastUpdated,Source\n';
    
    const rows = this.data.conversions.map(conv => {
      const fromName = this.data.programs[conv.from]?.name || conv.from;
      const toName = this.data.programs[conv.to]?.name || conv.to;
      
      return [
        `"${fromName}"`,
        `"${toName}"`,
        conv.rate,
        conv.bonus,
        conv.bonusRate || '',
        conv.instantTransfer,
        conv.minAmount || '',
        conv.lastUpdated,
        `"${conv.source || ''}"`
      ].join(',');
    });
    
    return headers + rows.join('\n');
  }

  async saveData() {
    console.log('\n💾 Saving data...');
    
    // Create backup before saving
    const backupResult = this.backup.autoBackup('save');
    if (backupResult.success) {
      console.log(`📦 Backup created: ${backupResult.filename}`);
    }
    
    // Update metadata
    this.data.lastUpdated = new Date().toISOString();
    
    try {
      fs.writeFileSync(this.dataPath, JSON.stringify(this.data, null, 2));
      console.log('✅ Data saved successfully!');
    } catch (error) {
      console.error('❌ Failed to save data:', error.message);
    }
  }

  ask(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }
}

// Install required dependencies check
async function checkDependencies() {
  const required = ['cheerio', 'ajv', 'ajv-formats'];
  const missing = [];
  
  for (const dep of required) {
    try {
      await import(dep);
    } catch (error) {
      missing.push(dep);
    }
  }
  
  if (missing.length > 0) {
    console.log('❌ Missing dependencies. Please install:');
    console.log(`npm install ${missing.join(' ')}`);
    process.exit(1);
  }
}

// Run the manager
if (import.meta.url === `file://${process.argv[1]}`) {
  await checkDependencies();
  
  const manager = new ConversionManager();
  manager.run().catch(console.error);
}

export default ConversionManager;