/**
 * Data validation and referential integrity checker
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { dataSchema } from './schema.js';

class DataValidator {
  constructor() {
    this.ajv = new Ajv({ allErrors: true });
    addFormats(this.ajv);
    this.validate = this.ajv.compile(dataSchema);
  }

  /**
   * Validate the entire data structure
   */
  validateData(data) {
    const valid = this.validate(data);
    return {
      valid,
      errors: this.validate.errors || []
    };
  }

  /**
   * Check referential integrity
   */
  checkReferentialIntegrity(data) {
    const issues = [];
    const programIds = new Set(Object.keys(data.programs || {}));
    
    // Check conversions reference valid programs
    const orphanedConversions = [];
    const missingPrograms = new Set();
    
    (data.conversions || []).forEach((conversion, index) => {
      if (!programIds.has(conversion.from)) {
        orphanedConversions.push({
          index,
          conversion,
          issue: `Unknown 'from' program: ${conversion.from}`
        });
        missingPrograms.add(conversion.from);
      }
      
      if (!programIds.has(conversion.to)) {
        orphanedConversions.push({
          index,
          conversion,
          issue: `Unknown 'to' program: ${conversion.to}`
        });
        missingPrograms.add(conversion.to);
      }
      
      // Check for self-referencing conversions
      if (conversion.from === conversion.to) {
        orphanedConversions.push({
          index,
          conversion,
          issue: 'Self-referencing conversion'
        });
      }
      
      // Validate bonus logic
      if (conversion.bonus && !conversion.bonusRate) {
        issues.push({
          type: 'bonus_inconsistency',
          message: `Conversion ${index + 1}: bonus=true but no bonusRate specified`,
          conversion
        });
      }
      
      if (!conversion.bonus && conversion.bonusRate) {
        issues.push({
          type: 'bonus_inconsistency',
          message: `Conversion ${index + 1}: bonus=false but bonusRate specified`,
          conversion
        });
      }
      
      // Check for expired bonuses
      if (conversion.bonus && conversion.bonusEndDate) {
        const endDate = new Date(conversion.bonusEndDate);
        if (endDate < new Date()) {
          issues.push({
            type: 'expired_bonus',
            message: `Conversion ${index + 1}: bonus expired on ${endDate.toDateString()}`,
            conversion
          });
        }
      }
    });
    
    // Check affiliate links reference valid programs
    (data.affiliateLinks || []).forEach((link, index) => {
      if (!programIds.has(link.program)) {
        issues.push({
          type: 'invalid_affiliate_program',
          message: `Affiliate link ${index + 1}: references unknown program '${link.program}'`,
          link
        });
      }
    });
    
    // Check for duplicate conversions
    const conversionMap = new Map();
    (data.conversions || []).forEach((conversion, index) => {
      const key = `${conversion.from}->${conversion.to}`;
      if (conversionMap.has(key)) {
        issues.push({
          type: 'duplicate_conversion',
          message: `Duplicate conversion found: ${key} (indices ${conversionMap.get(key)} and ${index})`,
          conversion
        });
      } else {
        conversionMap.set(key, index);
      }
    });
    
    return {
      valid: orphanedConversions.length === 0 && issues.length === 0,
      orphanedConversions,
      missingPrograms: Array.from(missingPrograms),
      issues,
      stats: {
        totalPrograms: programIds.size,
        totalConversions: (data.conversions || []).length,
        orphanedCount: orphanedConversions.length,
        issueCount: issues.length
      }
    };
  }

  /**
   * Validate and repair data automatically where possible
   */
  autoRepair(data) {
    const repairs = [];
    
    // Remove orphaned conversions if programs don't exist
    const programIds = new Set(Object.keys(data.programs || {}));
    const validConversions = [];
    
    (data.conversions || []).forEach((conversion, index) => {
      if (programIds.has(conversion.from) && programIds.has(conversion.to)) {
        // Auto-fix bonus inconsistencies
        if (conversion.bonus && !conversion.bonusRate) {
          conversion.bonusRate = conversion.rate * 1.25; // Default 25% bonus
          repairs.push(`Fixed missing bonusRate for conversion ${index + 1}`);
        }
        
        if (!conversion.bonus && conversion.bonusRate) {
          conversion.bonusRate = null;
          repairs.push(`Removed bonusRate for non-bonus conversion ${index + 1}`);
        }
        
        // Remove expired bonuses
        if (conversion.bonus && conversion.bonusEndDate) {
          const endDate = new Date(conversion.bonusEndDate);
          if (endDate < new Date()) {
            conversion.bonus = false;
            conversion.bonusRate = null;
            delete conversion.bonusEndDate;
            repairs.push(`Removed expired bonus for conversion ${index + 1}`);
          }
        }
        
        validConversions.push(conversion);
      } else {
        repairs.push(`Removed orphaned conversion ${index + 1}: ${conversion.from} -> ${conversion.to}`);
      }
    });
    
    data.conversions = validConversions;
    
    // Update metadata
    if (!data.metadata) data.metadata = {};
    if (!data.metadata.integrityChecks) data.metadata.integrityChecks = {};
    
    data.metadata.integrityChecks.lastReferentialCheck = new Date().toISOString();
    data.metadata.totalPrograms = programIds.size;
    data.metadata.totalConversions = validConversions.length;
    
    return {
      data,
      repairs,
      repairCount: repairs.length
    };
  }

  /**
   * Generate a comprehensive validation report
   */
  generateReport(data) {
    const schemaValidation = this.validateData(data);
    const integrityCheck = this.checkReferentialIntegrity(data);
    
    return {
      timestamp: new Date().toISOString(),
      schemaValidation,
      integrityCheck,
      summary: {
        valid: schemaValidation.valid && integrityCheck.valid,
        totalIssues: (schemaValidation.errors?.length || 0) + integrityCheck.issues.length,
        criticalIssues: integrityCheck.orphanedConversions.length,
        warnings: integrityCheck.issues.filter(i => i.type === 'expired_bonus').length
      }
    };
  }
}

export default DataValidator;