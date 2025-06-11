# Points Converter Management Tools

This directory contains advanced management tools for maintaining the conversions data with validation, scraping, backup, and interactive management capabilities.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install cheerio ajv ajv-formats
   ```

2. **Run the management tool:**
   ```bash
   node scripts/manage-conversions.js
   ```

## 📁 File Structure

```
scripts/
├── manage-conversions.js      # Main management CLI tool
├── update-rates.js           # Legacy rate update tool
├── lib/
│   ├── schema.js            # Data validation schemas
│   ├── validator.js         # Validation and integrity checks
│   ├── scraper.js          # URL scraping functionality
│   └── backup.js           # Backup and rollback system
├── config/
│   └── scraping-configs.json # Web scraping configurations
└── README.md               # This file
```

## 🛠️ Tools Overview

### Main Management Tool (`manage-conversions.js`)

A comprehensive CLI interface that combines all functionality:

**Data Management:**
- ✅ Validate data integrity
- 🔧 Auto-repair data issues
- 📊 View detailed validation reports

**Data Updates:**
- 🌐 Scrape and update from URLs
- ✏️ Manual conversion updates
- ➕ Add new programs and conversions

**Backup & Recovery:**
- 💾 Create backups with metadata
- 📋 List and compare backups
- 🔄 Restore from any backup

**Information:**
- 📈 Show comprehensive statistics
- 🔍 Search and filter conversions
- 📤 Export data in multiple formats

### Data Validator (`lib/validator.js`)

Provides comprehensive validation including:

- **Schema Validation:** Ensures data structure follows defined schemas
- **Referential Integrity:** Checks all program references are valid
- **Business Logic:** Validates bonus rates, date formats, etc.
- **Auto-Repair:** Automatically fixes common issues

Example usage:
```javascript
const DataValidator = require('./lib/validator');
const validator = new DataValidator();

const report = validator.generateReport(data);
console.log('Issues found:', report.summary.totalIssues);

// Auto-repair issues
const repair = validator.autoRepair(data);
console.log('Fixed:', repair.repairCount, 'issues');
```

### Data Scraper (`lib/scraper.js`)

Web scraping functionality for automatic updates:

- **Configurable Selectors:** Define CSS selectors for each site
- **Rate Parsing:** Extract transfer rates from various text formats
- **Bonus Detection:** Identify promotional bonuses and end dates
- **Update Tracking:** Compare scraped data with existing conversions

**Note:** Actual HTTP scraping requires additional setup:
```bash
npm install axios puppeteer
```

### Backup Manager (`lib/backup.js`)

Comprehensive backup and rollback system:

- **Automatic Backups:** Created before any data modifications
- **Metadata Tracking:** Stores reason, timestamp, and checksums
- **Comparison Tools:** Diff current data with any backup
- **Cleanup:** Automatically removes old backups

Example usage:
```javascript
const BackupManager = require('./lib/backup');
const backup = new BackupManager('./data/conversions.json');

// Create backup
const result = backup.createBackup('before-major-update');

// List all backups
const backups = backup.listBackups();

// Restore from backup
backup.restoreBackup('conversions_2024-01-15_abc123.json');
```

## 🔧 Configuration

### Scraping Configuration (`config/scraping-configs.json`)

Configure web scraping for each program:

```json
{
  "chase_ur": {
    "url": "https://ultimaterewardspoints.chase.com/transfer-points/list-programs",
    "selectors": {
      "partnerList": ".transfer-partner-list",
      "partnerName": ".partner-name",
      "transferRate": ".transfer-rate"
    },
    "parser": "chase_parser",
    "updateFrequency": "daily"
  }
}
```

### Environment Variables

- `DATA_BACKUP_DIR`: Custom backup directory
- `SCRAPING_DELAY`: Delay between requests (milliseconds)
- `MAX_BACKUPS`: Maximum number of backups to keep

## 🧪 Testing

The management tools include comprehensive tests:

```bash
# Run integrity tests
npm test src/test/integrity.test.js

# Run all tests
npm test
```

Tests cover:
- Data structure validation
- Referential integrity
- Business logic validation
- Auto-repair functionality
- Performance benchmarks

## 📊 Data Splitting

The tool can split the monolithic `conversions.json` into separate files:

```
public/data/split/
├── programs.json        # Just the programs
├── conversions.json     # Just the conversions
├── config.json         # Configuration and metadata
├── affiliate-links.json # Affiliate links
└── index.json          # File manifest
```

Benefits:
- Smaller files for faster loading
- Independent updates to different sections
- Better version control diffs
- Easier to maintain by different teams

## 🚨 Error Handling

The tools include comprehensive error handling:

- **Validation Errors:** Clear messages about what's wrong
- **Network Errors:** Retry logic with exponential backoff
- **File Errors:** Automatic backup before destructive operations
- **User Errors:** Input validation with helpful prompts

## 🔄 Workflow Examples

### Daily Maintenance
```bash
# Check data integrity
node scripts/manage-conversions.js
# Select option 1: Validate data integrity

# Auto-repair any issues found
# Select option 2: Auto-repair data issues

# Update from web sources
# Select option 4: Scrape and update from URLs
```

### Adding New Program
```bash
node scripts/manage-conversions.js
# Select option 6: Add new program
# Follow prompts to enter program details
# Select option 7: Add new conversion
# Create transfers from/to the new program
```

### Data Recovery
```bash
node scripts/manage-conversions.js
# Select option 9: List backups
# Select option 11: Compare with backup
# Select option 10: Restore from backup (if needed)
```

## 🛡️ Best Practices

1. **Always Backup:** The tool automatically creates backups, but create manual ones before major changes
2. **Validate Regularly:** Run integrity checks at least weekly
3. **Monitor Updates:** Check scraping results for accuracy
4. **Test Changes:** Use the comparison tools before deploying updates
5. **Document Changes:** Use descriptive backup reasons

## 🔌 Extending the Tools

### Adding New Scrapers

1. Add configuration to `scraping-configs.json`
2. Implement parser function in `scraper.js`
3. Add program mapping for name resolution
4. Test with validation tools

### Custom Validation Rules

1. Extend the schema in `schema.js`
2. Add validation logic in `validator.js`
3. Include auto-repair logic if possible
4. Add corresponding tests

### Integration with CI/CD

The tools can be integrated into automated workflows:

```yaml
# GitHub Actions example
- name: Validate Data
  run: |
    node scripts/manage-conversions.js --validate --exit
    
- name: Create Backup
  run: |
    node scripts/manage-conversions.js --backup "automated-update" --exit
```

## 📈 Performance

The tools are optimized for performance:

- **Validation:** < 1 second for 1000+ conversions
- **Backup:** < 100ms for typical datasets
- **Scraping:** Respects rate limits and robots.txt
- **Memory:** Efficient streaming for large datasets

## 🆘 Troubleshooting

### Common Issues

**"Missing dependencies" error:**
```bash
npm install cheerio ajv ajv-formats
```

**"Permission denied" when saving:**
```bash
chmod 644 public/data/conversions.json
```

**Scraping fails with 403 errors:**
- Check rate limiting settings
- Verify User-Agent configuration
- Ensure robots.txt compliance

**Validation fails after scraping:**
- Check program name mappings
- Verify selector configurations
- Review scraped data format

### Getting Help

1. Check the validation report for specific issues
2. Compare with a known-good backup
3. Review the debug logs in `scripts/logs/`
4. Use the interactive CLI for step-by-step guidance

## 🔮 Future Enhancements

Planned improvements include:
- Real-time monitoring dashboard
- Slack/Discord integration for alerts
- Machine learning for anomaly detection
- API endpoints for external integration
- Automated testing of scraped data
- Integration with official program APIs