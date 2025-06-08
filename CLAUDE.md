# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Points-converter.com is a website that allows users to convert between various points currencies (e.g., Chase UR points to Hyatt points). The site provides exchange rates, bonus information, and supports multi-step conversions.

## Technology Stack

- Frontend: Vanilla HTML, CSS, JavaScript
- Data: Static JSON files (manually updated)
- Hosting: Static site hosting (GitHub Pages, Netlify, etc.)

## Project Structure

```
/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Stylesheet
├── js/
│   └── converter.js    # Conversion logic and UI interactions
└── data/
    └── conversions.json # Static conversion data
```

## Development Commands

### Using npm scripts:
- `npm run dev` - Start development server on port 8000
- `npm run serve` - Alias for dev
- `npm run preview` - Preview on port 3000
- `npm run update-data` - Open conversions.json for editing

### Using make:
- `make help` - Show all available commands
- `make dev` - Start development server
- `make install` - Install dependencies
- `make deploy-test` - Test deployment locally
- `make update-data` - Edit conversion data

### Manual commands:
- `python -m http.server 8000` - Python server
- `npx serve -p 8000` - Node.js server

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

## Deployment

### Cloudflare Pages
1. Connect GitHub repository to Cloudflare Pages
2. Build settings:
   - Build command: (leave empty - static site)
   - Build output directory: `/`
3. The `_headers` and `_redirects` files are pre-configured

### Other Platforms
- GitHub Pages: Push to `gh-pages` branch or configure in settings
- Netlify: Drag and drop the folder or connect repo
- Vercel: Import project with default settings