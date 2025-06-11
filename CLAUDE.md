# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Points-converter.com is a website that allows users to convert between various points currencies (e.g., Chase UR points to Hyatt points). The site provides exchange rates, bonus information, and supports multi-step conversions.

## Technology Stack

- Frontend: React 18 + Vite
- Data: Static JSON files (manually updated)
- Management Tools: Node.js ES Modules with comprehensive validation and scraping
- Hosting: Static site hosting (GitHub Pages, Netlify, etc.)

## Important: ES Module Configuration

This project is configured as an ES module (`"type": "module"` in package.json). When creating new scripts or tools:

**Always use ES module syntax:**
```javascript
// ✅ Correct
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// For __dirname equivalent:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default ClassName;
export { namedExport };

// ❌ Incorrect (CommonJS)
const fs = require('fs');
module.exports = ClassName;
```

**Command line scripts must handle ES modules:**
```javascript
// ✅ For module detection
if (import.meta.url === `file://${process.argv[1]}`) {
  // Main execution
}

// ❌ Incorrect
if (require.main === module) {
  // This won't work in ES modules
}
```

## Project Structure

```
/
├── src/
│   ├── components/      # React components
│   │   ├── AppHeader.jsx
│   │   ├── ConversionForm.jsx
│   │   ├── TransferPreview.jsx
│   │   └── ...
│   ├── hooks/          # React custom hooks
│   │   ├── useConversions.js
│   │   └── useDollarValues.js
│   ├── test/           # Test files
│   │   ├── fixtures.js
│   │   ├── setup.js
│   │   ├── integrity.test.js  # Data integrity tests
│   │   └── *.test.jsx
│   ├── App.jsx         # Main React app
│   ├── main.jsx        # App entry point
│   └── style.css       # Global styles
├── scripts/            # Data management tools (ES modules)
│   ├── lib/           # Core management libraries
│   │   ├── validator.js   # Data validation & integrity
│   │   ├── scraper.js    # Web scraping framework
│   │   ├── backup.js     # Backup & rollback system
│   │   └── schema.js     # JSON validation schemas
│   ├── config/        # Configuration files
│   │   └── scraping-configs.json
│   ├── manage-conversions.js  # Main management CLI
│   ├── update-rates.js       # Legacy rate updater
│   └── README.md            # Management tools docs
├── public/             # Static assets
│   └── data/
│       └── conversions.json # Static conversion data
├── dist/               # Build output (generated)
├── index.html          # HTML template
├── vite.config.js      # Vite configuration
├── vitest.config.js    # Test configuration
├── package.json        # npm scripts and dependencies
├── Makefile           # Alternative command interface
├── README.md          # Project documentation
└── CLAUDE.md          # This file
```

## Development Commands

### Using npm scripts:
- `npm run dev` - Start Vite development server (http://localhost:5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build (http://localhost:4173)
- `npm run test` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI interface
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:integrity` - Run data integrity tests
- `npm run update-data` - Open conversions.json for editing
- `npm run manage-data` - **Run comprehensive data management tool**
- `npm run validate-data` - Quick data validation
- `npm run backup-data` - Create manual backup

### Using make:
- `make help` - Show all available commands
- `make dev` - Start development server
- `make build` - Build for production
- `make deploy-test` - Build and preview
- `make install` - Install dependencies
- `make test` - Run tests
- `make update-data` - Edit conversion data
- `make manage-data` - **Run comprehensive data management tool**
- `make validate-data` - Quick data validation
- `make backup-data` - Create manual backup
- `make test-integrity` - Run data integrity tests

## Key Features

1. Points currency conversion with exchange rates
2. Multi-step conversion paths
3. Display of current bonuses
4. Data source and last updated timestamp
5. Mobile-responsive design
6. Monetization placeholders for ads and affiliate links
7. **Comprehensive data management system with validation, scraping, and backup**

## React Architecture

The application uses modern React patterns:

### State Management
- **Local State**: Components use `useState` for local state management
- **Shared State**: Global conversion data shared via module-level variables and custom hooks
- **URL State**: URL parameters for bookmarkable conversion states
- **LocalStorage**: Advanced settings persisted in browser storage

### Custom Hooks
- **useConversions**: Manages conversion data loading and calculations
- **useDollarValues**: Handles currency formatting and dollar value calculations

### Component Patterns
- **Functional Components**: All components use React function syntax with hooks
- **Controlled Components**: Form inputs use controlled component pattern
- **Prop Drilling**: Simple prop passing for component communication
- **Conditional Rendering**: Uses `&&` and ternary operators for dynamic content

## Data Structure

The `conversions.json` file contains:
- Conversion rates between points programs
- Bonus information
- Transfer partners
- Last updated timestamp
- Data source information

## Testing

The project uses Vitest and React Testing Library for comprehensive testing:

### Test Types
- **Unit Tests**: Test individual functions and hooks (`src/test/useConversions.test.js`)
- **Component Tests**: Test React components in isolation (`src/test/ConversionForm.test.jsx`)
- **Integration Tests**: Test full app functionality (`src/test/integration.test.jsx`)

### Running Tests
- `npm run test` - Run tests in watch mode
- `npm run test:ui` - Open Vitest UI for interactive testing
- `npm run test:coverage` - Generate coverage report

### Test Structure
Tests are located in `src/test/` and use mock data from `fixtures.js` to ensure predictable testing conditions. React components are tested using React Testing Library with proper mocking of hooks and dependencies.

## Deployment

### Cloudflare Pages
1. **Connect Repository:**
   - Go to Cloudflare Pages dashboard
   - Click "Create a project" 
   - Connect your GitHub repository

2. **Build Settings:**
   - Framework preset: None (or React if available)
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/` (leave empty/default)

3. **Environment Variables:**
   - `NODE_VERSION = 18` (or 20 - required for Vite)

4. **Advanced Settings (Optional):**
   - Install command: `npm ci` (faster than npm install in CI)

The build process will:
- Run `npm install` to install dependencies
- Execute `npm run build` which runs Vite's production build
- Output optimized static files to `dist/` directory
- Serve the built site with automatic deployments on git push

### Other Platforms
- GitHub Pages: Push to `gh-pages` branch or configure in settings
- Netlify: Drag and drop the folder or connect repo
- Vercel: Import project with default settings