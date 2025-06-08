# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Points-converter.com is a website that allows users to convert between various points currencies (e.g., Chase UR points to Hyatt points). The site provides exchange rates, bonus information, and supports multi-step conversions.

## Technology Stack

- Frontend: Vue 3 + Vite
- Data: Static JSON files (manually updated)
- Hosting: Static site hosting (GitHub Pages, Netlify, etc.)

## Project Structure

```
/
├── src/
│   ├── components/      # Vue components
│   │   ├── AppHeader.vue
│   │   ├── ConversionForm.vue
│   │   ├── TransferPreview.vue
│   │   └── ...
│   ├── composables/     # Vue composables
│   │   └── useConversions.js
│   ├── App.vue         # Main Vue app
│   ├── main.js         # App entry point
│   └── style.css       # Global styles
├── public/             # Static assets
│   └── data/
│       └── conversions.json # Static conversion data
├── dist/               # Build output (generated)
├── index.html          # HTML template
├── vite.config.js      # Vite configuration
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
- `npm run update-data` - Open conversions.json for editing

### Using make:
- `make help` - Show all available commands
- `make dev` - Start development server
- `make build` - Build for production
- `make deploy-test` - Build and preview
- `make install` - Install dependencies
- `make test` - Run tests
- `make update-data` - Edit conversion data

## Key Features

1. Points currency conversion with exchange rates
2. Multi-step conversion paths
3. Display of current bonuses
4. Data source and last updated timestamp
5. Mobile-responsive design
6. Monetization placeholders for ads and affiliate links

## Data Structure

The `conversions.json` file contains:
- Conversion rates between points programs
- Bonus information
- Transfer partners
- Last updated timestamp
- Data source information

## Testing

The project uses Vitest and Vue Test Utils for comprehensive testing:

### Test Types
- **Unit Tests**: Test individual functions and composables (`src/test/useConversions.test.js`)
- **Component Tests**: Test Vue components in isolation (`src/test/ConversionForm.test.js`, `src/test/TransferPreview.test.js`)
- **Integration Tests**: Test full app functionality (`src/test/integration.test.js`)

### Running Tests
- `npm run test` - Run tests in watch mode
- `npm run test:ui` - Open Vitest UI for interactive testing
- `npm run test:coverage` - Generate coverage report

### Test Structure
Tests are located in `src/test/` and use mock data from `fixtures.js` to ensure predictable testing conditions.

## Deployment

### Cloudflare Pages
1. Connect GitHub repository to Cloudflare Pages
2. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
3. Environment variables: Node.js version should be 18+ for Vite compatibility

### Other Platforms
- GitHub Pages: Push to `gh-pages` branch or configure in settings
- Netlify: Drag and drop the folder or connect repo
- Vercel: Import project with default settings