# Points Converter

A simple web application for converting between loyalty points programs with current exchange rates and bonus information.

## Features

- Convert between major bank points (Chase UR, Amex MR, Citi TYP, Capital One)
- Convert to hotel programs (Hyatt, Marriott, Hilton, IHG)
- Convert to airline programs (United, American, Delta, Southwest, etc.)
- Multi-step conversion paths when direct transfers aren't available
- Current bonus rate indicators
- Mobile-responsive design
- Affiliate link placeholders for monetization

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

Edit `public/data/conversions.json` to:
- Update conversion rates
- Add/remove programs
- Update bonus information
- Change affiliate links

Remember to update the `lastUpdated` field when making changes.

## Deployment

### Cloudflare Pages (Recommended)

1. Push your code to GitHub
2. In Cloudflare Pages dashboard:
   - Create a new project
   - Connect your GitHub repository
   - Build settings:
     - Build command: (leave empty)
     - Build output directory: `/public`
3. Deploy!

The site includes `_headers` for security and caching, and `_redirects` for future API routing in the public directory.

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