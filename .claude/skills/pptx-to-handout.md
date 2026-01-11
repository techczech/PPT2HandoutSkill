# PPTX to Handout Site

Convert PowerPoint presentations into interactive React handout websites.

## Description

This skill creates a professional, responsive handout website from a PowerPoint presentation. The generated site includes:
- Interactive slide viewer with keyboard navigation
- Home page with session info and resources
- Resources page with auto-extracted tools and links
- Mobile-friendly responsive design
- One-click deployment to Vercel or Cloudflare

## Usage

```
/pptx-to-handout [path-to-pptx-or-json-folder]
```

## Workflow

### Step 1: Determine Input Type

Ask the user which input they have:

1. **Pre-extracted JSON** - User has `presentation.json` + `media/` folder (from their own extraction tool)
2. **Raw PPTX file** - Extract content using built-in Python script
3. **Start fresh** - Clone template repository for manual setup

### Step 2: Extract Content (if PPTX)

If user has a PPTX file, run the extraction script:

```bash
pip install python-pptx
python scripts/extract-pptx.py <input.pptx> sourcematerials/
```

**Important:** Inform the user about extraction limitations:
- SmartArt diagrams are exported as images (structure not preserved)
- Animations and transitions are ignored
- Some formatting may be simplified
- Manual review is recommended

### Step 3: Collect Session Metadata

Prompt the user for required information:

1. **Presentation title** - Main title for the site
2. **Subtitle** - Tagline or description
3. **Speaker name** - Presenter's full name
4. **Speaker affiliation** - Organization/institution
5. **Speaker email** - Contact email
6. **Speaker website** - Personal/professional URL
7. **Speaker bio** - Brief biography (1-2 paragraphs)
8. **Event name** - Conference/workshop name
9. **Event date** - Date of presentation
10. **Event time** - Time slot
11. **Event location** - Venue/room
12. **Session type** - Workshop, Talk, Seminar, etc.
13. **Session link** - URL to conference page (optional)
14. **Abstract** - Session description (can be multi-paragraph)
15. **Example apps** - Related apps to showcase (optional, array)

### Step 4: Generate sessionInfo.ts

Create `src/data/sessionInfo.ts` from the template with collected metadata.

### Step 5: Process Media

Run the media processing script:

```bash
npm run build
```

This will:
- Copy media files to `public/assets/`
- Transform paths in `presentation.json`
- Build the React application

### Step 6: Preview and Review

Start the development server for user review:

```bash
npm run dev
```

Guide user to check:
- All slides render correctly
- Images and videos display properly
- Navigation works (arrow keys, click)
- Mobile responsiveness

### Step 7: Deploy (Optional)

Offer deployment options:

**Vercel:**
```bash
vercel --prod --yes
```

**Cloudflare Pages:**
```bash
wrangler pages deploy dist --project-name=<project-name>
```

## Template Repository

**Primary source:** https://github.com/techczech/PPT2HandoutSkill

Clone for new projects:
```bash
git clone https://github.com/techczech/PPT2HandoutSkill my-handout
cd my-handout
npm install
```

## File Structure

```
project/
├── sourcematerials/           # Input (gitignored)
│   ├── presentation.json      # Extracted slide content
│   └── media/{uuid}/          # Images, videos
├── src/
│   ├── data/
│   │   ├── presentation.json  # Processed (generated)
│   │   ├── sessionInfo.ts     # Session metadata (customize)
│   │   └── types.ts           # TypeScript types
│   ├── components/            # React components (don't modify)
│   ├── pages/                 # Page components (don't modify)
│   └── index.css              # Styles (customize colors)
├── public/assets/             # Static media (generated)
├── scripts/
│   ├── processMedia.js        # Build-time processor
│   └── extract-pptx.py        # PPTX extractor
└── package.json
```

## Customization

### Colors (src/index.css)

```css
:root {
  --color-primary: #1e3a5f;        /* Main brand color */
  --color-primary-light: #2d5a87;  /* Lighter variant */
  --color-accent: #e07a38;         /* Accent/highlight color */
  --color-surface: #faf9f7;        /* Background */
  --color-card: #ffffff;           /* Card backgrounds */
  --color-text: #2d3748;           /* Main text */
  --color-text-muted: #64748b;     /* Secondary text */
}
```

### Fonts

Default fonts are Inter (sans-serif) and Playfair Display (serif). Modify the Google Fonts import in `src/index.css` to change.

## Requirements

- Node.js 18+
- npm or yarn
- Python 3.8+ (for PPTX extraction)
- python-pptx library (`pip install python-pptx`)

## Troubleshooting

### Images not showing
- Check that media files are in `sourcematerials/media/{uuid}/`
- Run `npm run build` to process media
- Verify paths in `src/data/presentation.json`

### Slides not rendering
- Check `presentation.json` structure matches expected format
- Verify TypeScript types in `src/data/types.ts`
- Check browser console for errors

### SmartArt not displaying correctly
- SmartArt is extracted as images by default
- For complex diagrams, manually recreate structure in JSON
- Use `smart_art` content type with nested nodes

## Example Session Info

```typescript
export const sessionInfo = {
  title: "My Workshop Title",
  subtitle: "A subtitle for the presentation",
  speaker: {
    name: "Jane Doe",
    affiliation: "University of Example",
    email: "jane@example.edu",
    links: { website: "https://janedoe.com" },
    bio: "Jane is a researcher in..."
  },
  event: {
    name: "Conference 2026",
    date: "January 15, 2026",
    time: "14:00 - 15:30",
    location: "Room 101",
    type: "Workshop",
    sessionLink: "https://conference.com/session/123"
  },
  abstract: "This workshop covers...",
  exampleApps: [
    { name: "Demo App", url: "https://demo.app", description: "Example" }
  ]
};
```
