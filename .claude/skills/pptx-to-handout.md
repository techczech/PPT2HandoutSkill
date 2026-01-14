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

### Step 1: Gather Key Information Upfront

**IMPORTANT:** Before starting any work, ask the user these key questions to avoid back-and-forth later:

1. **Project name** - What should the project/site be called? (e.g., "ai-workshop-2026")
2. **Presentation title** - Main title for the handout site
3. **Presenter name and profile link** - Full name and URL to link to (e.g., staff profile page, personal website)
4. **Input type** - Which do you have?
   - Pre-extracted JSON (already have `presentation.json` + `media/` folder)
   - Raw PPTX file (needs extraction)
   - Start fresh (clone template only)
5. **Deployment target** - Where will this be deployed?
   - Cloudflare Pages (has 25MB file limit, will auto-compress videos if ffmpeg available)
   - Vercel (no file size limit)
   - Other/none

Use the AskUserQuestion tool to gather this information efficiently. This saves time by collecting all key details upfront.

### Step 2: Extract Content (if PPTX)

Based on the answers from Step 1, proceed with extraction if needed.

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

### Step 3: Review Extracted Content (Optional)

If the presentation was extracted, review key points with the user:
- Ask if the title and subtitle are correct
- Check if speaker information is accurate
- Verify any key topics or resources were captured correctly

This allows quick adjustments before final generation.

### Step 4: Generate sessionInfo.ts

Use the information collected in Step 1 plus any additional details to create `src/data/sessionInfo.ts`:
- Use the presenter name and profile link from Step 1
- Use the presentation title from Step 1
- Fill in other details (affiliation, email, bio, event info, abstract)
- If information is missing, use reasonable defaults or ask for critical fields only

### Step 5: Process Media

Run the media processing script:

```bash
npm run build
```

This will:
- Copy media files to `public/assets/`
- Automatically compress videos over 25MB (if ffmpeg is installed and deploying to Cloudflare Pages)
- Transform paths in `presentation.json`
- Build the React application

**Note:** If deploying to Cloudflare Pages and large videos are detected, the script will:
- Check if ffmpeg is available
- Automatically compress videos to fit under the 25MB limit
- Log compression progress and final sizes

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
- ffmpeg (optional, for automatic video compression when deploying to Cloudflare Pages)
  - macOS: `brew install ffmpeg`
  - Ubuntu/Debian: `apt-get install ffmpeg`
  - Windows: Download from ffmpeg.org

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
