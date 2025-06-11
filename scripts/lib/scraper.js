/**
 * URL scraping and data extraction functionality
 */

import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DataScraper {
  constructor() {
    this.scrapingConfigs = this.loadScrapingConfigs();
  }

  loadScrapingConfigs() {
    const configPath = path.join(__dirname, '../config/scraping-configs.json');
    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
      // Return default configs if file doesn't exist
      return {
        chase_ur: {
          url: 'https://ultimaterewardspoints.chase.com/transfer-points/list-programs',
          selectors: {
            partnerList: '.partner-list',
            partnerName: '.partner-name',
            transferRate: '.transfer-rate',
            bonusInfo: '.bonus-info'
          },
          parser: 'chase_parser'
        },
        amex_mr: {
          url: 'https://global.americanexpress.com/rewards/transfer',
          selectors: {
            partnerList: '.transfer-partners',
            partnerName: '.partner-name',
            transferRate: '.ratio'
          },
          parser: 'amex_parser'
        },
        citi_typ: {
          url: 'https://www.thankyou.com/partnerProgramsListing.htm',
          selectors: {
            partnerList: '.partner-grid',
            partnerName: '.partner-title',
            transferRate: '.transfer-ratio'
          },
          parser: 'citi_parser'
        }
      };
    }
  }

  /**
   * Scrape data from a URL
   */
  async scrapeUrl(url, config = {}) {
    try {
      // Note: In a real implementation, you'd want to use a proper HTTP client
      // For demo purposes, this shows the structure
      const response = await this.fetchWithHeaders(url, {
        'User-Agent': 'Mozilla/5.0 (compatible; points-converter-bot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
        ...config.headers
      });

      const $ = cheerio.load(response.data);
      return { $, html: response.data, url };
    } catch (error) {
      throw new Error(`Failed to scrape ${url}: ${error.message}`);
    }
  }

  /**
   * Parse Chase Ultimate Rewards data
   */
  parseChaseData($) {
    const partners = [];
    
    $('.partner-item, .transfer-partner').each((i, elem) => {
      const $elem = $(elem);
      const name = $elem.find('.partner-name, .program-name').text().trim();
      const rateText = $elem.find('.transfer-rate, .ratio').text().trim();
      const bonusText = $elem.find('.bonus-info, .promotion').text().trim();
      
      if (name && rateText) {
        const rate = this.parseTransferRate(rateText);
        const bonus = this.parseBonus(bonusText);
        
        partners.push({
          name,
          rate,
          bonus: bonus.hasBonus,
          bonusRate: bonus.rate,
          bonusEndDate: bonus.endDate,
          instantTransfer: !$elem.find('.delayed, .not-instant').length,
          source: 'chase_ur',
          lastUpdated: new Date().toISOString()
        });
      }
    });
    
    return partners;
  }

  /**
   * Parse Amex Membership Rewards data
   */
  parseAmexData($) {
    const partners = [];
    
    $('.transfer-partner-item, .partner-card').each((i, elem) => {
      const $elem = $(elem);
      const name = $elem.find('.partner-name, .airline-name, .hotel-name').text().trim();
      const rateText = $elem.find('.transfer-ratio, .ratio').text().trim();
      
      if (name && rateText) {
        const rate = this.parseTransferRate(rateText);
        
        partners.push({
          name,
          rate,
          bonus: false, // Amex rarely shows bonuses on main page
          bonusRate: null,
          instantTransfer: true, // Most Amex transfers are instant
          source: 'amex_mr',
          lastUpdated: new Date().toISOString()
        });
      }
    });
    
    return partners;
  }

  /**
   * Parse transfer rate from various text formats
   */
  parseTransferRate(rateText) {
    // Handle formats like "1:1", "1000:1000", "5:4", "1.25"
    const ratioMatch = rateText.match(/(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)/);
    if (ratioMatch) {
      const from = parseFloat(ratioMatch[1]);
      const to = parseFloat(ratioMatch[2]);
      return to / from;
    }
    
    // Handle decimal format
    const decimalMatch = rateText.match(/(\d+(?:\.\d+)?)/);
    if (decimalMatch) {
      return parseFloat(decimalMatch[1]);
    }
    
    return 1.0; // Default fallback
  }

  /**
   * Parse bonus information from text
   */
  parseBonus(bonusText) {
    if (!bonusText || bonusText.toLowerCase().includes('no bonus')) {
      return { hasBonus: false, rate: null, endDate: null };
    }
    
    // Look for percentage bonuses like "25% bonus" or "1.25x"
    const percentMatch = bonusText.match(/(\d+)%\s*bonus/i);
    if (percentMatch) {
      const percent = parseInt(percentMatch[1]);
      return {
        hasBonus: true,
        rate: 1 + (percent / 100),
        endDate: this.parseEndDate(bonusText)
      };
    }
    
    // Look for multiplier bonuses like "1.25x"
    const multiplierMatch = bonusText.match(/(\d+(?:\.\d+)?)x/i);
    if (multiplierMatch) {
      return {
        hasBonus: true,
        rate: parseFloat(multiplierMatch[1]),
        endDate: this.parseEndDate(bonusText)
      };
    }
    
    return { hasBonus: false, rate: null, endDate: null };
  }

  /**
   * Parse end date from bonus text
   */
  parseEndDate(text) {
    const datePatterns = [
      /through\s+(\w+\s+\d+,?\s+\d{4})/i,
      /until\s+(\w+\s+\d+,?\s+\d{4})/i,
      /ends?\s+(\w+\s+\d+,?\s+\d{4})/i,
      /(\d{1,2}\/\d{1,2}\/\d{4})/,
      /(\d{4}-\d{2}-\d{2})/
    ];
    
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          const date = new Date(match[1]);
          if (!isNaN(date.getTime())) {
            return date.toISOString();
          }
        } catch (error) {
          // Continue to next pattern
        }
      }
    }
    
    return null;
  }

  /**
   * Update conversions with scraped data
   */
  updateConversionsWithScrapedData(existingData, scrapedData, sourceProgram) {
    const updates = [];
    const currentTime = new Date().toISOString();
    
    scrapedData.forEach(scraped => {
      // Find matching partner program by name
      const targetProgram = this.findProgramByName(existingData.programs, scraped.name);
      
      if (targetProgram) {
        // Find existing conversion
        const existingConversion = existingData.conversions.find(
          conv => conv.from === sourceProgram && conv.to === targetProgram.id
        );
        
        if (existingConversion) {
          // Update existing conversion
          const changes = [];
          
          if (existingConversion.rate !== scraped.rate) {
            changes.push(`rate: ${existingConversion.rate} -> ${scraped.rate}`);
            existingConversion.rate = scraped.rate;
          }
          
          if (existingConversion.bonus !== scraped.bonus) {
            changes.push(`bonus: ${existingConversion.bonus} -> ${scraped.bonus}`);
            existingConversion.bonus = scraped.bonus;
          }
          
          if (existingConversion.bonusRate !== scraped.bonusRate) {
            changes.push(`bonusRate: ${existingConversion.bonusRate} -> ${scraped.bonusRate}`);
            existingConversion.bonusRate = scraped.bonusRate;
          }
          
          if (changes.length > 0) {
            existingConversion.lastUpdated = currentTime;
            updates.push({
              type: 'updated',
              conversion: `${sourceProgram} -> ${targetProgram.id}`,
              changes
            });
          }
        } else {
          // Add new conversion
          const newConversion = {
            from: sourceProgram,
            to: targetProgram.id,
            rate: scraped.rate,
            bonus: scraped.bonus,
            bonusRate: scraped.bonusRate,
            bonusEndDate: scraped.bonusEndDate,
            instantTransfer: scraped.instantTransfer,
            lastUpdated: currentTime,
            source: this.scrapingConfigs[sourceProgram]?.url
          };
          
          existingData.conversions.push(newConversion);
          updates.push({
            type: 'added',
            conversion: `${sourceProgram} -> ${targetProgram.id}`,
            data: newConversion
          });
        }
      }
    });
    
    return updates;
  }

  /**
   * Find program by name (fuzzy matching)
   */
  findProgramByName(programs, name) {
    const searchName = name.toLowerCase().trim();
    
    // Exact match first
    for (const [id, program] of Object.entries(programs)) {
      if (program.name.toLowerCase() === searchName || 
          program.shortName.toLowerCase() === searchName) {
        return { id, ...program };
      }
    }
    
    // Partial match
    for (const [id, program] of Object.entries(programs)) {
      if (program.name.toLowerCase().includes(searchName) || 
          searchName.includes(program.name.toLowerCase())) {
        return { id, ...program };
      }
    }
    
    return null;
  }

  /**
   * Mock fetch function - replace with actual HTTP client
   */
  async fetchWithHeaders(url, headers) {
    // In a real implementation, use axios, node-fetch, or similar
    throw new Error('HTTP client not implemented - this is a demo structure');
  }

  /**
   * Save scraping results for debugging
   */
  saveScrapingResults(results, filename) {
    const resultsDir = path.join(__dirname, '../results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    const filepath = path.join(resultsDir, `${filename}_${Date.now()}.json`);
    fs.writeFileSync(filepath, JSON.stringify(results, null, 2));
    return filepath;
  }
}

export default DataScraper;