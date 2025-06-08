#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const conversionsPath = path.join(__dirname, '../public/data/conversions.json');

class ConversionDataManager {
  constructor() {
    this.data = JSON.parse(fs.readFileSync(conversionsPath, 'utf8'));
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async run() {
    console.log('🔄 Points Converter Data Manager');
    console.log('================================\n');
    
    while (true) {
      console.log('Available actions:');
      console.log('1. List all conversions');
      console.log('2. Update conversion rate');
      console.log('3. Update bonus information');
      console.log('4. Add minimum transfer amount');
      console.log('5. Add new conversion');
      console.log('6. Save and exit');
      console.log('7. Exit without saving\n');
      
      const choice = await this.ask('Select an action (1-7): ');
      
      switch (choice) {
        case '1':
          this.listConversions();
          break;
        case '2':
          await this.updateRate();
          break;
        case '3':
          await this.updateBonus();
          break;
        case '4':
          await this.updateMinAmount();
          break;
        case '5':
          await this.addConversion();
          break;
        case '6':
          this.saveData();
          this.rl.close();
          return;
        case '7':
          console.log('Exiting without saving...');
          this.rl.close();
          return;
        default:
          console.log('Invalid choice. Please try again.\n');
      }
    }
  }

  listConversions() {
    console.log('\n📊 Current Conversions:');
    console.log('========================');
    
    this.data.conversions.forEach((conv, index) => {
      const fromName = this.data.programs[conv.from]?.name || conv.from;
      const toName = this.data.programs[conv.to]?.name || conv.to;
      const rate = conv.bonus ? `${conv.rate} (Bonus: ${conv.bonusRate})` : conv.rate;
      const minAmount = conv.minAmount ? `Min: ${conv.minAmount}` : 'No min';
      const lastUpdated = new Date(conv.lastUpdated).toLocaleDateString();
      
      console.log(`${index + 1}. ${fromName} → ${toName}`);
      console.log(`   Rate: 1:${rate} | ${minAmount} | Updated: ${lastUpdated}`);
      
      if (conv.bonus && conv.bonusEndDate) {
        console.log(`   Bonus ends: ${new Date(conv.bonusEndDate).toLocaleDateString()}`);
      }
      if (conv.note) {
        console.log(`   Note: ${conv.note}`);
      }
      console.log('');
    });
  }

  async updateRate() {
    this.listConversions();
    const index = await this.ask('Enter conversion number to update: ');
    const convIndex = parseInt(index) - 1;
    
    if (convIndex < 0 || convIndex >= this.data.conversions.length) {
      console.log('Invalid conversion number.\n');
      return;
    }
    
    const conv = this.data.conversions[convIndex];
    const fromName = this.data.programs[conv.from]?.name || conv.from;
    const toName = this.data.programs[conv.to]?.name || conv.to;
    
    console.log(`\nUpdating: ${fromName} → ${toName}`);
    console.log(`Current rate: 1:${conv.rate}`);
    
    const newRate = await this.ask('Enter new rate (e.g., 1.5): ');
    const parsedRate = parseFloat(newRate);
    
    if (isNaN(parsedRate) || parsedRate <= 0) {
      console.log('Invalid rate. Please enter a positive number.\n');
      return;
    }
    
    conv.rate = parsedRate;
    conv.lastUpdated = new Date().toISOString();
    
    console.log(`✅ Rate updated to 1:${parsedRate}\n`);
  }

  async updateBonus() {
    this.listConversions();
    const index = await this.ask('Enter conversion number to update bonus: ');
    const convIndex = parseInt(index) - 1;
    
    if (convIndex < 0 || convIndex >= this.data.conversions.length) {
      console.log('Invalid conversion number.\n');
      return;
    }
    
    const conv = this.data.conversions[convIndex];
    const fromName = this.data.programs[conv.from]?.name || conv.from;
    const toName = this.data.programs[conv.to]?.name || conv.to;
    
    console.log(`\nUpdating bonus for: ${fromName} → ${toName}`);
    
    const hasBonus = await this.ask('Is there a bonus active? (y/n): ');
    
    if (hasBonus.toLowerCase() === 'y') {
      const bonusRate = await this.ask('Enter bonus rate (e.g., 1.3): ');
      const parsedBonusRate = parseFloat(bonusRate);
      
      if (isNaN(parsedBonusRate) || parsedBonusRate <= 0) {
        console.log('Invalid bonus rate.\n');
        return;
      }
      
      const endDate = await this.ask('Enter bonus end date (YYYY-MM-DD) or press enter for no end date: ');
      
      conv.bonus = true;
      conv.bonusRate = parsedBonusRate;
      if (endDate.trim()) {
        conv.bonusEndDate = new Date(endDate + 'T23:59:59Z').toISOString();
      } else {
        delete conv.bonusEndDate;
      }
    } else {
      conv.bonus = false;
      conv.bonusRate = null;
      delete conv.bonusEndDate;
    }
    
    conv.lastUpdated = new Date().toISOString();
    console.log('✅ Bonus information updated\n');
  }

  async updateMinAmount() {
    this.listConversions();
    const index = await this.ask('Enter conversion number to update minimum amount: ');
    const convIndex = parseInt(index) - 1;
    
    if (convIndex < 0 || convIndex >= this.data.conversions.length) {
      console.log('Invalid conversion number.\n');
      return;
    }
    
    const conv = this.data.conversions[convIndex];
    const fromName = this.data.programs[conv.from]?.name || conv.from;
    const toName = this.data.programs[conv.to]?.name || conv.to;
    
    console.log(`\nUpdating minimum amount for: ${fromName} → ${toName}`);
    console.log(`Current minimum: ${conv.minAmount || 'None set'}`);
    
    const minAmount = await this.ask('Enter minimum transfer amount (or 0 for no minimum): ');
    const parsedAmount = parseInt(minAmount);
    
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      console.log('Invalid amount. Please enter a non-negative number.\n');
      return;
    }
    
    if (parsedAmount === 0) {
      delete conv.minAmount;
    } else {
      conv.minAmount = parsedAmount;
    }
    
    conv.lastUpdated = new Date().toISOString();
    console.log(`✅ Minimum amount updated\n`);
  }

  async addConversion() {
    console.log('\n➕ Adding new conversion');
    console.log('Available programs:');
    
    Object.entries(this.data.programs).forEach(([id, program]) => {
      console.log(`  ${id}: ${program.name}`);
    });
    
    const from = await this.ask('\nEnter FROM program ID: ');
    const to = await this.ask('Enter TO program ID: ');
    
    if (!this.data.programs[from] || !this.data.programs[to]) {
      console.log('Invalid program ID(s).\n');
      return;
    }
    
    const rate = await this.ask('Enter conversion rate (e.g., 1.0): ');
    const parsedRate = parseFloat(rate);
    
    if (isNaN(parsedRate) || parsedRate <= 0) {
      console.log('Invalid rate.\n');
      return;
    }
    
    const instantTransfer = await this.ask('Is this an instant transfer? (y/n): ');
    const minAmount = await this.ask('Enter minimum transfer amount (or 0 for none): ');
    const parsedMinAmount = parseInt(minAmount);
    
    const newConversion = {
      from,
      to,
      rate: parsedRate,
      bonus: false,
      bonusRate: null,
      instantTransfer: instantTransfer.toLowerCase() === 'y',
      lastUpdated: new Date().toISOString()
    };
    
    if (parsedMinAmount > 0) {
      newConversion.minAmount = parsedMinAmount;
    }
    
    this.data.conversions.push(newConversion);
    console.log('✅ Conversion added\n');
  }

  saveData() {
    fs.writeFileSync(conversionsPath, JSON.stringify(this.data, null, 2));
    console.log('✅ Data saved successfully!');
  }

  ask(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }
}

// Run the manager
if (require.main === module) {
  const manager = new ConversionDataManager();
  manager.run().catch(console.error);
}

module.exports = ConversionDataManager;