# PPT2Handout - PowerPoint to Handout Site Generator

Convert PowerPoint presentations into interactive React handout websites.

## Features

- Interactive slide viewer with keyboard navigation
- Automatic resource extraction (tools, links, terms)
- Responsive design for mobile and desktop
- One-click deployment to Vercel or Cloudflare Pages
- Claude Code skill for guided setup

## Quick Start

### 1. Clone this template

```bash
git clone https://github.com/techczech/PPT2HandoutSkill my-handout
cd my-handout
npm install
```

### 2. Extract your PowerPoint

**Option A: Using the built-in extractor**

```bash
pip install python-pptx
python scripts/extract-pptx.py your-presentation.pptx sourcematerials/
```

**Option B: Use your own extraction tool**

Place your `presentation.json` and media files in `sourcematerials/`.

### 3. Update session info

Edit `src/data/sessionInfo.ts` with your presentation details:
- Title and subtitle
- Speaker information
- Event details
- Abstract

### 4. Build and preview

```bash
npm run build
npm run dev
```

### 5. Deploy

**Vercel:**
```bash
npx vercel --prod
```

**Cloudflare Pages:**
```bash
npx wrangler pages deploy dist --project-name=my-handout
```

## Using with Claude Code

This template includes a Claude Code skill for guided setup:

```
/pptx-to-handout
```

The skill will walk you through:
- Extracting content from your PPTX
- Filling in session metadata
- Building and deploying

## Project Structure

```
├── src/
│   ├── data/
│   │   ├── presentation.json   # Generated from PPTX
│   │   ├── sessionInfo.ts      # Your session details
│   │   └── types.ts            # TypeScript types
│   ├── components/             # React components
│   ├── pages/                  # Page components
│   └── index.css               # Styles (customize colors here)
├── scripts/
│   ├── processMedia.js         # Build-time processor
│   └── extract-pptx.py         # PPTX extraction script
├── public/assets/              # Generated media files
└── sourcematerials/            # Your PPTX export (gitignored)
```

## Customization

### Colors

Edit the CSS variables in `src/index.css`:

```css
:root {
  --color-primary: #1e3a5f;
  --color-accent: #e07a38;
  /* ... */
}
```

### Fonts

The default fonts are Inter and Playfair Display. Modify the Google Fonts import in `src/index.css` to change.

## Requirements

- Node.js 18+
- Python 3.8+ (for PPTX extraction)
- python-pptx (`pip install python-pptx`)

## License

MIT
