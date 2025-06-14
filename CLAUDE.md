# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Points-converter.com is a website that allows users to convert between various points currencies (e.g., Chase UR points to Hyatt points). The site provides exchange rates, bonus information, and supports multi-step conversions.

## Technology Stack

- Frontend: React 18 + Vite
- Backend API: Go with Gin framework (serves conversion data)
- Data: Static JSON files (manually updated) + Go API
- Management Tools: Node.js ES Modules with comprehensive validation and scraping
- Hosting: Frontend on static hosting (GitHub Pages, Netlify, etc.) + API on Fly.io

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
│   ├── contexts/       # React contexts
│   │   └── ConversionContext.jsx  # API/data loading context
│   ├── hooks/          # React custom hooks
│   │   ├── useConversions.js
│   │   ├── useDollarValues.js
│   │   └── useURLHistory.js
│   ├── test/           # Test files
│   │   ├── fixtures.js
│   │   ├── setup.js
│   │   ├── integrity.test.js  # Data integrity tests
│   │   └── *.test.jsx
│   ├── App.jsx         # Main React app
│   ├── main.jsx        # App entry point
│   └── style.css       # Global styles
├── api/                # Go API backend
│   ├── main.go         # API server entry point
│   ├── go.mod          # Go module dependencies
│   ├── go.sum          # Go module checksums
│   ├── Dockerfile      # Docker configuration for deployment
│   ├── fly.toml        # Fly.io deployment configuration
│   ├── conversions.json # Copy of data for Docker build
│   └── api.log         # API server logs (generated)
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
├── dev.log             # Frontend dev server logs (generated)
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

### Using make (recommended for development):
- `make help` - Show all available commands

**Frontend Development:**
- `make dev` - **Smart frontend server** (only starts if not running, logs to dev.log)
- `make dev-logs` - View frontend server logs (reads dev.log)
- `make dev-stop` - Stop frontend development server

**Backend API Development:**
- `make api-dev` - **Smart API server** (only starts if not running, logs to api/api.log)
- `make api-logs` - View API server logs (reads api/api.log)
- `make api-stop` - Stop API development server

**Build & Test:**
- `make build` - Build frontend for production
- `make install` - Install frontend dependencies
- `make test` - Run tests

**Data Management:**
- `make update-data` - Edit conversion data
- `make manage-data` - **Run comprehensive data management tool**
- `make validate-data` - Quick data validation
- `make backup-data` - Create manual backup
- `make test-integrity` - Run data integrity tests

**Development Server Management:**
Both `make dev` and `make api-dev` provide intelligent server management:
- Check if server is already running on respective ports (5173 for frontend, 8080 for API)
- Only start server if not already running (prevents conflicts)
- Run servers in background with logs written to respective log files
- Use `make dev-logs` or `make api-logs` to view logs (reads log files directly)
- Use `make dev-stop` or `make api-stop` to cleanly stop servers

**Note:** The log commands read log files directly rather than using `tail -f` to avoid timeout issues in some environments.

## Key Features

1. Points currency conversion with exchange rates
2. Multi-step conversion paths
3. Display of current bonuses
4. Data source and last updated timestamp
5. Mobile-responsive design
6. **Browser history support** - Back/forward buttons work for program selection
7. **URL state management** - Bookmarkable conversion states
8. **Go API backend** - Serves conversion data with fallback to static JSON
9. **Environment-aware API** - Auto-detects production vs development for correct API endpoint
10. Monetization placeholders for ads and affiliate links
11. **Comprehensive data management system with validation, scraping, and backup**

## React Architecture

The application uses modern React patterns:

### State Management
- **Local State**: Components use `useState` for local state management
- **Shared State**: Global conversion data shared via module-level variables and custom hooks
- **URL State**: URL parameters for bookmarkable conversion states
- **LocalStorage**: Advanced settings persisted in browser storage

### Custom Hooks
- **useConversions**: Manages conversion data loading and calculations (from ConversionContext)
- **useDollarValues**: Handles currency formatting and dollar value calculations
- **useURLHistory**: Manages browser history and URL state synchronization

### Context Management
- **ConversionContext**: Provides global conversion data and API loading logic
  - **Production**: Uses `https://api.points-converter.com/api/v1/conversions`
  - **Development**: Uses `http://localhost:8080/api/v1/conversions` (localhost detection)
  - **Fallback**: Static JSON (`/data/conversions.json`) if API fails

### Component Patterns
- **Functional Components**: All components use React function syntax with hooks
- **Controlled Components**: Form inputs use controlled component pattern
- **Prop Drilling**: Simple prop passing for component communication
- **Conditional Rendering**: Uses `&&` and ternary operators for dynamic content

### Styling Architecture
- **CSS Modules**: All components use CSS Modules for scoped styling (`*.module.css`)
- **No Inline Styles**: Avoid inline styles in favor of CSS classes
- **Responsive Design**: Use CSS media queries for responsive behavior
- **Utility Functions**: Shared styling utilities in `src/components/utils.js`
- **Consistent Patterns**: Standardized class naming and CSS organization

## Data Structure

The `conversions.json` file contains:
- Conversion rates between points programs
- Bonus information
- Transfer partners
- Last updated timestamp
- Data source information

## Go API Backend

The Go API provides a REST endpoint to serve conversion data:

### API Endpoints
- `GET /api/v1/conversions` - Returns complete conversion data
- `GET /api/v1/health` - Health check endpoint

### API Configuration
- **Framework**: Gin (Go web framework)
- **CORS**: Configured for localhost development servers
- **Security**: Trusted proxies disabled for security
- **Data Loading**: Reads `conversions.json` at startup with fallback paths
- **Port**: 8080 (configurable via PORT environment variable)

### Local Development
- Data loaded from `../public/data/conversions.json` (relative to api directory)
- Hot reload: Restart API server after changes to Go code
- Logs written to `api/api.log` when using `make api-dev`

### Production Deployment (Fly.io)
- Deployed at: `https://points-converter-api.fly.dev`
- Docker containerized with multi-stage build
- Data copied into container as `conversions.json`
- Health checks configured via `fly.toml`
- Auto-scaling with machine sleep when idle

## Testing

**⚠️ CRITICAL: Always ensure ALL tests are passing before making changes or commits.**

The project uses Vitest and React Testing Library for comprehensive testing:

### Test Requirements
- **All tests must pass**: Never commit code that breaks existing tests
- **Run tests frequently**: Always run `npm run test` after any significant changes
- **Fix broken tests immediately**: If tests fail, fix them before proceeding
- **Test-driven development**: Write tests for new features and bug fixes

### Test Types
- **Unit Tests**: Test individual functions and hooks (`src/test/useConversions.test.js`)
- **Component Tests**: Test React components in isolation (`src/test/ConversionForm.test.jsx`)
- **Integration Tests**: Test full app functionality (`src/test/integration.test.jsx`)
- **Data Integrity Tests**: Validate conversion data structure and values (`src/test/integrity.test.js`)

### Running Tests
- `npm run test` - **Run tests in non-watch mode (use this for CI/validation)**
- `npm run test -- --watch` - Run tests in watch mode during development
- `npm run test:ui` - Open Vitest UI for interactive testing
- `npm run test:coverage` - Generate coverage report

### Test Structure
Tests are located in `src/test/` and use mock data from `fixtures.js` to ensure predictable testing conditions. React components are tested using React Testing Library with proper mocking of hooks and dependencies.

### Before Every Commit
1. Run `npm run test` to ensure all tests pass
2. Run `npm run build` to ensure the application builds successfully
3. Only commit when both tests and build are successful

## Deployment

### Frontend Deployment (Static Hosting)

#### Cloudflare Pages
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

#### Other Frontend Platforms
- GitHub Pages: Push to `gh-pages` branch or configure in settings
- Netlify: Drag and drop the folder or connect repo
- Vercel: Import project with default settings

### Backend API Deployment (Fly.io)

The Go API is deployed on Fly.io with the following setup:

#### Prerequisites
- Install Fly CLI: `brew install flyctl` (macOS) or see [Fly.io docs](https://fly.io/docs/hands-on/install-flyctl/)
- Login: `flyctl auth login`

#### Deployment Configuration
- **App Name**: `points-converter-api`
- **Region**: `ord` (Chicago)
- **URL**: `https://points-converter-api.fly.dev`

#### Key Files
- `api/fly.toml` - Fly.io app configuration
- `api/Dockerfile` - Multi-stage Docker build
- `api/conversions.json` - Data file copied during Docker build

#### Deployment Process
1. Copy latest data: `cp public/data/conversions.json api/`
2. Deploy: `cd api && flyctl deploy`

#### Production Features
- Health checks on `/api/v1/health`
- Auto-scaling with machine sleep when idle
- HTTPS by default
- Resource limits: 256MB RAM, 1 shared CPU

#### Monitoring
- View logs: `flyctl logs -a points-converter-api`
- App status: `flyctl status -a points-converter-api`