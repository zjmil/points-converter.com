/**
 * Referential integrity tests for conversions data
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import our validation tools
import DataValidator from '../../scripts/lib/validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Referential Integrity Tests', () => {
  let validator;
  let testData;

  beforeEach(() => {
    validator = new DataValidator();
    
    // Load actual data for testing
    const dataPath = path.join(__dirname, '../../public/data/conversions.json');
    testData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  });

  describe('Data Structure Validation', () => {
    it('should validate the main data schema', () => {
      const result = validator.validateData(testData);
      
      expect(result.valid).toBe(true);
      if (!result.valid) {
        console.log('Schema validation errors:', result.errors);
      }
    });

    it('should have required top-level properties', () => {
      expect(testData).toHaveProperty('programs');
      expect(testData).toHaveProperty('conversions');
      expect(testData).toHaveProperty('lastUpdated');
      expect(testData).toHaveProperty('dataSource');
    });

    it('should have valid programs structure', () => {
      expect(typeof testData.programs).toBe('object');
      
      Object.entries(testData.programs).forEach(([id, program]) => {
        expect(program).toHaveProperty('name');
        expect(program).toHaveProperty('shortName');
        expect(program).toHaveProperty('type');
        expect(program).toHaveProperty('dollarValue');
        
        expect(typeof program.name).toBe('string');
        expect(typeof program.shortName).toBe('string');
        expect(typeof program.type).toBe('string');
        expect(typeof program.dollarValue).toBe('number');
        expect(program.dollarValue).toBeGreaterThan(0);
      });
    });

    it('should have valid conversions structure', () => {
      expect(Array.isArray(testData.conversions)).toBe(true);
      
      testData.conversions.forEach((conversion, index) => {
        expect(conversion, `Conversion at index ${index} is invalid`).toHaveProperty('from');
        expect(conversion, `Conversion at index ${index} is invalid`).toHaveProperty('to');
        expect(conversion, `Conversion at index ${index} is invalid`).toHaveProperty('rate');
        expect(conversion, `Conversion at index ${index} is invalid`).toHaveProperty('bonus');
        expect(conversion, `Conversion at index ${index} is invalid`).toHaveProperty('instantTransfer');
        expect(conversion, `Conversion at index ${index} is invalid`).toHaveProperty('lastUpdated');
        
        expect(typeof conversion.from, `Conversion at index ${index} from field invalid`).toBe('string');
        expect(typeof conversion.to, `Conversion at index ${index} to field invalid`).toBe('string');
        expect(typeof conversion.rate, `Conversion at index ${index} rate field invalid`).toBe('number');
        expect(typeof conversion.bonus, `Conversion at index ${index} bonus field invalid`).toBe('boolean');
        expect(typeof conversion.instantTransfer, `Conversion at index ${index} instantTransfer field invalid`).toBe('boolean');
        
        expect(conversion.rate, `Conversion at index ${index} rate should be positive`).toBeGreaterThan(0);
        
        // If bonus is true, should have bonusRate
        if (conversion.bonus) {
          expect(conversion, `Conversion at index ${index} should have bonusRate`).toHaveProperty('bonusRate');
          expect(typeof conversion.bonusRate, `Conversion at index ${index} bonusRate should be number`).toBe('number');
          expect(conversion.bonusRate, `Conversion at index ${index} bonusRate should be positive`).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Referential Integrity', () => {
    it('should have all conversion programs exist in programs list', () => {
      const result = validator.checkReferentialIntegrity(testData);
      
      expect(result.orphanedConversions).toHaveLength(0);
      
      if (result.orphanedConversions.length > 0) {
        console.log('Orphaned conversions found:', result.orphanedConversions);
      }
    });

    it('should not have self-referencing conversions', () => {
      const selfReferencing = testData.conversions.filter(
        conv => conv.from === conv.to
      );
      
      expect(selfReferencing).toHaveLength(0);
    });

    it('should not have duplicate conversions', () => {
      const conversionMap = new Map();
      const duplicates = [];
      
      testData.conversions.forEach((conversion, index) => {
        const key = `${conversion.from}->${conversion.to}`;
        
        if (conversionMap.has(key)) {
          duplicates.push({
            key,
            indices: [conversionMap.get(key), index]
          });
        } else {
          conversionMap.set(key, index);
        }
      });
      
      expect(duplicates).toHaveLength(0);
      
      if (duplicates.length > 0) {
        console.log('Duplicate conversions found:', duplicates);
      }
    });

    it('should have consistent bonus information', () => {
      const inconsistencies = [];
      
      testData.conversions.forEach((conversion, index) => {
        if (conversion.bonus && !conversion.bonusRate) {
          inconsistencies.push({
            index,
            issue: 'bonus=true but no bonusRate'
          });
        }
        
        if (!conversion.bonus && conversion.bonusRate) {
          inconsistencies.push({
            index,
            issue: 'bonus=false but has bonusRate'
          });
        }
        
        if (conversion.bonus && conversion.bonusRate <= conversion.rate) {
          inconsistencies.push({
            index,
            issue: 'bonusRate should be greater than regular rate'
          });
        }
      });
      
      expect(inconsistencies).toHaveLength(0);
      
      if (inconsistencies.length > 0) {
        console.log('Bonus inconsistencies found:', inconsistencies);
      }
    });

    it('should have valid date formats', () => {
      const invalidDates = [];
      
      // Check main lastUpdated
      try {
        new Date(testData.lastUpdated);
      } catch (error) {
        invalidDates.push('main lastUpdated');
      }
      
      // Check conversion lastUpdated dates
      testData.conversions.forEach((conversion, index) => {
        try {
          const date = new Date(conversion.lastUpdated);
          if (isNaN(date.getTime())) {
            invalidDates.push(`conversion ${index} lastUpdated`);
          }
        } catch (error) {
          invalidDates.push(`conversion ${index} lastUpdated`);
        }
        
        // Check bonus end dates
        if (conversion.bonusEndDate) {
          try {
            const date = new Date(conversion.bonusEndDate);
            if (isNaN(date.getTime())) {
              invalidDates.push(`conversion ${index} bonusEndDate`);
            }
          } catch (error) {
            invalidDates.push(`conversion ${index} bonusEndDate`);
          }
        }
      });
      
      expect(invalidDates).toHaveLength(0);
      
      if (invalidDates.length > 0) {
        console.log('Invalid dates found:', invalidDates);
      }
    });

    it('should have affiliate links reference valid programs', () => {
      if (!testData.affiliateLinks) return;
      
      const programIds = new Set(Object.keys(testData.programs));
      const invalidLinks = [];
      
      testData.affiliateLinks.forEach((link, index) => {
        if (!programIds.has(link.program)) {
          invalidLinks.push({
            index,
            program: link.program,
            name: link.name
          });
        }
      });
      
      expect(invalidLinks).toHaveLength(0);
      
      if (invalidLinks.length > 0) {
        console.log('Invalid affiliate links found:', invalidLinks);
      }
    });
  });

  describe('Data Quality Checks', () => {
    it('should have reasonable dollar values', () => {
      const unreasonableValues = [];
      
      Object.entries(testData.programs).forEach(([id, program]) => {
        if (program.dollarValue > 0.1 || program.dollarValue < 0.001) {
          unreasonableValues.push({
            id,
            name: program.name,
            value: program.dollarValue
          });
        }
      });
      
      // This is a warning, not a hard failure
      if (unreasonableValues.length > 0) {
        console.warn('Programs with unusual dollar values:', unreasonableValues);
      }
    });

    it('should have reasonable transfer rates', () => {
      const unreasonableRates = [];
      
      testData.conversions.forEach((conversion, index) => {
        if (conversion.rate > 10 || conversion.rate < 0.001) {
          unreasonableRates.push({
            index,
            from: conversion.from,
            to: conversion.to,
            rate: conversion.rate
          });
        }
      });
      
      // This is a warning, not a hard failure
      if (unreasonableRates.length > 0) {
        console.warn('Conversions with unusual rates:', unreasonableRates);
      }
    });

    it('should not have expired bonuses', () => {
      const expiredBonuses = [];
      const now = new Date();
      
      testData.conversions.forEach((conversion, index) => {
        if (conversion.bonus && conversion.bonusEndDate) {
          const endDate = new Date(conversion.bonusEndDate);
          if (endDate < now) {
            expiredBonuses.push({
              index,
              from: conversion.from,
              to: conversion.to,
              endDate: conversion.bonusEndDate
            });
          }
        }
      });
      
      // This is a warning, not a hard failure
      if (expiredBonuses.length > 0) {
        console.warn('Expired bonuses found:', expiredBonuses);
      }
    });

    it('should have recent updates', () => {
      const outdatedConversions = [];
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      testData.conversions.forEach((conversion, index) => {
        const lastUpdated = new Date(conversion.lastUpdated);
        if (lastUpdated < sixMonthsAgo) {
          outdatedConversions.push({
            index,
            from: conversion.from,
            to: conversion.to,
            lastUpdated: conversion.lastUpdated
          });
        }
      });
      
      // This is informational
      if (outdatedConversions.length > 0) {
        console.info(`${outdatedConversions.length} conversions haven't been updated in 6+ months`);
      }
    });
  });

  describe('Auto-repair functionality', () => {
    it('should fix bonus inconsistencies', () => {
      // Create test data with inconsistencies
      const brokenData = {
        programs: {
          test_a: { name: 'Test A', shortName: 'A', type: 'bank', dollarValue: 0.01 },
          test_b: { name: 'Test B', shortName: 'B', type: 'airline', dollarValue: 0.01 }
        },
        conversions: [
          {
            from: 'test_a',
            to: 'test_b',
            rate: 1.0,
            bonus: true,
            bonusRate: null, // This should be fixed
            instantTransfer: true,
            lastUpdated: new Date().toISOString()
          }
        ],
        lastUpdated: new Date().toISOString(),
        dataSource: 'test'
      };
      
      const result = validator.autoRepair(brokenData);
      
      expect(result.repairCount).toBeGreaterThan(0);
      expect(result.data.conversions[0].bonusRate).toBeTruthy();
    });

    it('should remove orphaned conversions', () => {
      // Create test data with orphaned conversion
      const brokenData = {
        programs: {
          test_a: { name: 'Test A', shortName: 'A', type: 'bank', dollarValue: 0.01 }
        },
        conversions: [
          {
            from: 'test_a',
            to: 'nonexistent_program', // This should be removed
            rate: 1.0,
            bonus: false,
            bonusRate: null,
            instantTransfer: true,
            lastUpdated: new Date().toISOString()
          }
        ],
        lastUpdated: new Date().toISOString(),
        dataSource: 'test'
      };
      
      const result = validator.autoRepair(brokenData);
      
      expect(result.repairCount).toBeGreaterThan(0);
      expect(result.data.conversions).toHaveLength(0);
    });
  });

  describe('Performance checks', () => {
    it('should validate large datasets efficiently', () => {
      const startTime = Date.now();
      
      const result = validator.checkReferentialIntegrity(testData);
      
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      expect(result.valid).toBeDefined();
    });
  });
});