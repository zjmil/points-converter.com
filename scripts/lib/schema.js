/**
 * Data validation schema for conversions.json
 */

const programSchema = {
  type: 'object',
  required: ['name', 'shortName', 'type', 'dollarValue'],
  properties: {
    name: { type: 'string', minLength: 1 },
    shortName: { type: 'string', minLength: 1 },
    type: { 
      type: 'string', 
      enum: ['bank', 'airline', 'hotel', 'retail', 'other'] 
    },
    dollarValue: { type: 'number', minimum: 0 },
    icon: { type: 'string' },
    website: { type: 'string', format: 'uri' },
    notes: { type: 'string' }
  }
};

const conversionSchema = {
  type: 'object',
  required: ['from', 'to', 'rate', 'bonus', 'instantTransfer', 'lastUpdated'],
  properties: {
    from: { type: 'string', minLength: 1 },
    to: { type: 'string', minLength: 1 },
    rate: { type: 'number', minimum: 0 },
    bonus: { type: 'boolean' },
    bonusRate: { 
      type: ['number', 'null'], 
      minimum: 0
    },
    bonusEndDate: { 
      type: 'string', 
      format: 'date-time' 
    },
    instantTransfer: { type: 'boolean' },
    minAmount: { type: 'number', minimum: 0 },
    maxAmount: { type: 'number', minimum: 0 },
    note: { type: 'string' },
    source: { type: 'string', format: 'uri' },
    lastUpdated: { type: 'string', format: 'date-time' },
    scrapingConfig: {
      type: 'object',
      properties: {
        url: { type: 'string', format: 'uri' },
        selector: { type: 'string' },
        parser: { type: 'string' },
        updateFrequency: { type: 'string' }
      }
    }
  }
};

const affiliateLinkSchema = {
  type: 'object',
  required: ['name', 'program', 'bonus', 'url', 'annualFee'],
  properties: {
    name: { type: 'string', minLength: 1 },
    program: { type: 'string', minLength: 1 },
    bonus: { type: 'string' },
    url: { type: 'string' },
    annualFee: { type: 'string' },
    expirationDate: { type: 'string', format: 'date-time' }
  }
};

const configSchema = {
  type: 'object',
  properties: {
    showAdvertisements: { type: 'boolean' },
    showAffiliateLinks: { type: 'boolean' },
    autoUpdateEnabled: { type: 'boolean' },
    backupEnabled: { type: 'boolean' },
    maxBackupCount: { type: 'number', minimum: 1 }
  }
};

const dataSchema = {
  type: 'object',
  required: ['lastUpdated', 'dataSource', 'programs', 'conversions'],
  properties: {
    lastUpdated: { type: 'string', format: 'date-time' },
    dataSource: { type: 'string' },
    version: { type: 'string' },
    config: configSchema,
    programs: {
      type: 'object',
      patternProperties: {
        '^[a-z_]+$': programSchema
      }
    },
    conversions: {
      type: 'array',
      items: conversionSchema
    },
    affiliateLinks: {
      type: 'array',
      items: affiliateLinkSchema
    },
    metadata: {
      type: 'object',
      properties: {
        totalPrograms: { type: 'number' },
        totalConversions: { type: 'number' },
        lastValidation: { type: 'string', format: 'date-time' },
        integrityChecks: {
          type: 'object',
          properties: {
            lastReferentialCheck: { type: 'string', format: 'date-time' },
            orphanedConversions: { type: 'number' },
            missingPrograms: { type: 'array', items: { type: 'string' } }
          }
        }
      }
    }
  }
};

export {
  programSchema,
  conversionSchema,
  affiliateLinkSchema,
  configSchema,
  dataSchema
};