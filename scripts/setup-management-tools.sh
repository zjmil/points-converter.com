#!/bin/bash

# Setup script for Points Converter Management Tools
# This script installs dependencies and verifies the management system

set -e

echo "🎯 Setting up Points Converter Management Tools"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "✅ Dependencies installed"

echo ""
echo "🔍 Validating current data..."
npm run validate-data

echo ""
echo "💾 Creating initial backup..."
npm run backup-data

echo ""
echo "🧪 Running integrity tests..."
npm run test:integrity

echo ""
echo "📊 Available commands:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎮 Interactive Management:"
echo "   npm run manage-data      # Comprehensive management tool"
echo "   make manage-data         # Same as above"
echo ""
echo "🔧 Quick Commands:"
echo "   npm run validate-data    # Validate data integrity"
echo "   npm run backup-data      # Create manual backup"
echo "   npm run test:integrity   # Run integrity tests"
echo ""
echo "📋 Legacy Tools:"
echo "   npm run update-data      # Simple rate updates"
echo "   make update-data         # Edit data file directly"
echo ""
echo "🛠️  Development:"
echo "   npm run dev              # Start development server"
echo "   npm run test             # Run all tests"
echo "   npm run build            # Build for production"

echo ""
echo "✨ Setup complete! Run 'npm run manage-data' to get started."

# Check if directories exist and create them if needed
echo ""
echo "📁 Creating required directories..."

# Create backup directory
mkdir -p "$(dirname "$(realpath public/data/conversions.json)")/backups"
echo "   ✅ Backup directory created"

# Create export directory
mkdir -p scripts/exports
echo "   ✅ Export directory created"

# Create results directory for scraping
mkdir -p scripts/results
echo "   ✅ Results directory created"

# Create logs directory
mkdir -p scripts/logs
echo "   ✅ Logs directory created"

echo ""
echo "🎉 All set! The management tools are ready to use."
echo ""
echo "💡 Quick start:"
echo "   1. Run: npm run manage-data"
echo "   2. Select option 1 to validate your data"
echo "   3. Explore the other features!"
echo ""
echo "📚 For detailed documentation, see scripts/README.md"