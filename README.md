# Points Converter

A simple web application for converting between loyalty points programs with current exchange rates and bonus information.

## Features

- Convert between major bank points (Chase UR, Amex MR, Citi TYP, Capital One)
- Convert to hotel programs (Hyatt, Marriott, Hilton, IHG)
- Convert to airline programs (United, American, Delta, Southwest, etc.)
- Multi-step conversion paths when direct transfers aren't available
- Current bonus rate indicators with expiration dates
- Minimum transfer amount warnings
- Individual conversion update tracking
- Clickable transfer previews for quick selection
- **URL sharing** - Share specific conversions via URL parameters
- **Data management tools** - Interactive CLI for updating rates
- Mobile-responsive design
- Configurable advertisements and affiliate links

### URL Sharing

Share specific conversions by using URL parameters:
- `?from=chase_ur&to=hyatt&amount=50000` - Pre-fill conversion form
- `?from=amex_mr&to=united` - Set currencies (default amount)
- Parameters: `from`, `to`, `amount`

## Quick Start

```bash
# Using npm scripts
npm run dev

# Using make
make dev

# Or manually with Python
python -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## Available Commands

### npm scripts
- `npm run dev` - Start development server on port 8000
- `npm run preview` - Preview on port 3000
- `npm run update-data` - Edit conversion data

### Make commands
- `make help` - Show all available commands
- `make dev` - Start development server
- `make install` - Install dependencies
- `make deploy-test` - Test deployment locally

## Updating Data

### Interactive Data Manager

Use the interactive data management tool:

```bash
npm run update-data
```

This tool allows you to:
- Update conversion rates in real-time
- Add/modify bonus information with end dates
- Set minimum transfer amounts
- Add new conversion routes
- Automatically update timestamps

### Manual Editing

Alternatively, edit `public/data/conversions.json` directly:

```bash
npm run edit-data
```

Each conversion now includes:
- `rate`: Base conversion rate
- `bonus`: Whether a bonus is currently active
- `bonusRate`: Enhanced rate during bonus periods
- `bonusEndDate`: When the bonus expires (optional)
- `minAmount`: Minimum points required for transfer
- `lastUpdated`: When this conversion was last verified
- `instantTransfer`: Whether transfer is immediate

## Deployment

### Cloudflare Pages (Recommended)

1. **Push your code to GitHub**

2. **In Cloudflare Pages dashboard:**
   - Create a new project
   - Connect your GitHub repository
   - **Build settings:**
     - Framework preset: None (or Vue if available)
     - Build command: `npm run build`
     - Build output directory: `dist`
     - Root directory: `/` (leave empty/default)
   - **Environment variables:**
     - `NODE_VERSION = 18` (required for Vite)
   - **Advanced settings (optional):**
     - Install command: `npm ci`

3. **Deploy!**

The build will automatically:
- Install dependencies with npm
- Run Vite's optimized production build
- Deploy the generated static files
- Set up automatic deployments on future git pushes

### Other Platforms

- **GitHub Pages**: Enable in repository settings
- **Netlify**: Drag and drop or connect repo
- **Vercel**: Import with default settings

## Future Enhancements

- API integration for real-time rates
- User accounts to save favorite conversions
- Email alerts for bonus opportunities
- More complex multi-step routing
- Historical rate tracking