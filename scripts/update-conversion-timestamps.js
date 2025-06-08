#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const conversionsPath = path.join(__dirname, '../public/data/conversions.json');
const data = JSON.parse(fs.readFileSync(conversionsPath, 'utf8'));

// Add lastUpdated to any conversion that doesn't have it
const defaultTimestamp = '2024-01-08T12:00:00Z';

data.conversions = data.conversions.map(conversion => {
  if (!conversion.lastUpdated) {
    return {
      ...conversion,
      lastUpdated: defaultTimestamp
    };
  }
  return conversion;
});

// Write back to file
fs.writeFileSync(conversionsPath, JSON.stringify(data, null, 2));
console.log(`Updated ${data.conversions.length} conversions with timestamps`);