# PPT2Handout - PowerPoint to Handout Site Generator

> **This is the canonical repository for the `pptx-to-handout` Claude Code skill.**
>
> It contains both the skill definition (SKILL.md) and the React template that the skill uses to generate handout sites.

Convert PowerPoint presentations into interactive React handout websites with automatic resource extraction, responsive design, and easy deployment.

**📋 [View Changelog](CHANGELOG.md)** - See what's new in the latest version

## Installing the Skill

To use this skill in any Claude Code project, create a symlink to this repository:

```bash
# From your project directory
mkdir -p .claude/skills
ln -s /path/to/PPT2HandoutSkill .claude/skills/pptx-to-handout
```

The skill will then be available via `/pptx-to-handout` in that project.

**Example:** If this repo is at `~/gitrepos/ppt-tools/PPT2HandoutSkill`:
```bash
ln -s ~/gitrepos/ppt-tools/PPT2HandoutSkill .claude/skills/pptx-to-handout
```

## Features

- **Interactive slide viewer** with keyboard navigation and progress tracking
- **Expandable sidebar** - navigate by section or individual slides
- **Search functionality** - press `/` to search all slides, content, and speaker notes
- **Media gallery** - browse all images and videos in a filterable grid view
- **Auto-linkified URLs** - all URLs in content become clickable links (open in new tab)
- **Styled bullet points** - accent-colored square markers
- **Automatic resource extraction** - tools, links, and key terms pulled from slides
- **Automatic video compression** - compresses videos over 25MB for Cloudflare Pages compatibility
- **Responsive design** for mobile and desktop
- **Multiple content types** - text, images, SmartArt diagrams, videos
- **Section-based navigation** with sidebar menu
- **One-click deployment** to Vercel or Cloudflare Pages
- **Claude Code skill** for guided setup

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` `→` `Space` | Navigate slides |
| `↑` `↓` | Navigate sections |
| `/` | Open search |
| `Home` `End` | Go to first/last slide |
| `Esc` | Close search modal |

## Quick Start

### 1. Clone this template

```bash
git clone https://github.com/techczech/PPT2HandoutSkill my-handout
cd my-handout
npm install
```

### 2. Extract your PowerPoint

**Option A: Using the built-in Python extractor**

```bash
pip install python-pptx
python scripts/extract-pptx.py your-presentation.pptx sourcematerials/
```

This creates:
- `sourcematerials/presentation.json` - structured slide content
- `sourcematerials/media/{uuid}/` - extracted images, icons, videos

**Option B: Use pre-extracted content**

If you already have extracted content (e.g., from another tool), place files in:
- `sourcematerials/presentation.json`
- `sourcematerials/media/{any-folder-name}/` - media files

The build process auto-detects media folders, so any folder name works.

### 3. Update session info

Edit `src/data/sessionInfo.ts` with your presentation details:

```typescript
export const sessionInfo = {
  title: "Your Presentation Title",
  subtitle: "Your subtitle or tagline",

  speaker: {
    name: "Your Name",
    affiliation: "Your Organization",
    email: "you@example.com",
    links: { website: "https://yoursite.com" },
    bio: `Your bio text...`,
  },

  event: {
    name: "Conference Name",
    date: "Friday, 9 January 2026",
    time: "14:00 – 15:15",
    location: "Room Name",
    type: "Workshop",
    sessionLink: "https://conference.com/session",
  },

  abstract: `Your session abstract...`,

  exampleApps: [
    { name: "App Name", url: "https://app.com", description: "Brief description" },
  ],
};
```

### 4. Build and preview

```bash
npm run build    # Process media, compile TypeScript, bundle
npm run dev      # Start local dev server
```

The build process:
1. **Processes media** - copies files to `public/assets/`, organizes by type
2. **Compresses large videos** - automatically compresses videos over 25MB (requires ffmpeg)
3. **Transforms paths** - updates `presentation.json` with correct asset URLs
4. **Compiles TypeScript** - type checks the codebase
5. **Bundles with Vite** - creates optimized production build in `dist/`

### 5. Deploy

**Cloudflare Pages:**
```bash
npx wrangler pages deploy dist --project-name=my-handout
```

**Vercel:**
```bash
npx vercel --prod
```

## Complete Workflow Example

Here's a real-world example of converting a presentation:

```bash
# 1. Clone template
git clone https://github.com/techczech/PPT2HandoutSkill ltvibes
cd ltvibes
npm install

# 2. Copy pre-extracted content (if using external extractor)
mkdir -p sourcematerials
cp /path/to/presentation.json sourcematerials/
cp -r /path/to/media sourcematerials/

# 3. Edit sessionInfo.ts with your details
# (use your editor of choice)

# 4. Build
npm run build
# Output:
#   Found media folder: 79d04a3e-63a2-4dd4-aeee-e0fc24139adf
#   Media processing complete!
#     - Slide images: 65
#     - Icons: 41
#     - Videos: 10
#   Presentation data transformed and saved!

# 5. Test locally
npm run dev
# Visit http://localhost:5173

# 6. Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name=my-handout
```

## Using with Claude Code

This template includes a Claude Code skill for guided setup:

```
/pptx-to-handout
```

The skill walks you through:
- Detecting input type (PPTX file, pre-extracted JSON, or fresh start)
- Extracting content from your PPTX
- Filling in session metadata interactively
- Building and deploying

## Project Structure

```
├── src/
│   ├── data/
│   │   ├── presentation.json   # Generated slide content (from build)
│   │   ├── sessionInfo.ts      # Your session details (edit this)
│   │   └── types.ts            # TypeScript interfaces
│   ├── components/
│   │   ├── content/            # Content renderers (lists, images, LinkifiedText)
│   │   ├── layout/             # Layout components (header, nav, sidebar, etc.)
│   │   ├── search/             # Search modal component
│   │   └── slides/             # Slide type components
│   ├── pages/                  # Page components (Home, Slides, Resources, MediaGallery)
│   ├── hooks/                  # React hooks (navigation, keyboard, search)
│   ├── utils/                  # Utilities (resource extraction, linkify, helpers)
│   ├── App.tsx                 # Main router
│   └── index.css               # Global styles (customize colors here)
├── scripts/
│   ├── processMedia.js         # Build-time media processor
│   └── extract-pptx.py         # PPTX extraction script
├── public/assets/              # Generated media files (from build)
│   ├── images/slides/          # Slide images
│   ├── images/icons/           # SmartArt icons (sa_*.png)
│   └── videos/                 # Video files
├── sourcematerials/            # Your input files (gitignored)
│   ├── presentation.json       # Extracted slide content
│   └── media/{uuid}/           # Extracted media files
└── dist/                       # Production build output
```

## Media File Conventions

The `processMedia.js` script organizes files by type:

| File Pattern | Destination | Description |
|--------------|-------------|-------------|
| `*.mp4` | `/assets/videos/` | Video files |
| `sa_*.png`, `sa_*.jpg` | `/assets/images/icons/` | SmartArt icons |
| Other images | `/assets/images/slides/` | Slide images |

## Customization

### Colors

Edit the CSS variables in `src/index.css`:

```css
:root {
  --color-primary: #1e3a5f;    /* Main brand color */
  --color-accent: #e07a38;      /* Accent/highlight color */
  --color-surface: #faf9f7;     /* Background color */
  --color-card: #ffffff;        /* Card background */
  --color-text: #1a1a1a;        /* Primary text */
  --color-text-muted: #6b7280;  /* Secondary text */
}
```

### Fonts

The default fonts are Inter (sans-serif) and Playfair Display (serif). Modify the Google Fonts import in `src/index.css` to change:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
```

### Slide Layouts

The site supports multiple slide layouts (defined in `src/components/slides/`):
- `TitleSlide` - Title page with speaker info
- `SectionHeader` - Section dividers
- `ContentSlide` - Text and bullet points
- `MediaSlide` - Image-focused slides
- `SidebarSlide` - Two-column layout
- `QuoteSlide` - Quotes and testimonials

## presentation.json Format

The expected JSON structure:

```json
{
  "metadata": {
    "id": "uuid",
    "source_file": "presentation.pptx",
    "processed_at": "2026-01-13T18:27:57.617218",
    "stats": { "slide_count": 102, "image_count": 65 }
  },
  "sections": [
    {
      "title": "Section Name",
      "slides": [
        {
          "order": 1,
          "title": "Slide Title",
          "layout": "Title and Content",
          "notes": "Speaker notes...",
          "content": [
            { "type": "heading", "text": "Heading", "level": 1 },
            { "type": "list", "style": "bullet", "items": [...] },
            { "type": "image", "src": "media/uuid/slide_1.png", "alt": "..." },
            { "type": "video", "src": "media/uuid/video.mp4", "title": "..." },
            { "type": "smart_art", "layout": "...", "nodes": [...] }
          ]
        }
      ]
    }
  ]
}
```

## Requirements

- **Node.js 18+** - for building and running the site
- **Python 3.8+** - for PPTX extraction (optional if using pre-extracted content)
- **python-pptx** - `pip install python-pptx`
- **ffmpeg** - for automatic video compression (optional but recommended for Cloudflare Pages)
  - macOS: `brew install ffmpeg`
  - Ubuntu/Debian: `apt-get install ffmpeg`
  - Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html)

## Troubleshooting

### Media not processing
If you see "Source media directory not found", ensure your media files are in `sourcematerials/media/{folder-name}/`. The script auto-detects any folder name.

### Images not displaying
Run `npm run build` before `npm run dev` to ensure media is copied to `public/assets/`.

### Large videos failing deployment
Cloudflare Pages has a 25MB file size limit. The build process automatically compresses videos over this limit if ffmpeg is installed. If you see the warning "ffmpeg not found", install it to enable automatic compression.

### TypeScript errors
The template uses strict TypeScript. Check `src/data/types.ts` for expected interfaces.

## Repository Scope

This repository is the **canonical home** for the `pptx-to-handout` skill. It contains:

**What belongs here:**
- `SKILL.md` and `references/` - Skill definition and documentation
- `src/` - React application template
- `scripts/` - PPTX extraction and media processing tools
- `README.md`, `CLAUDE.md` - Documentation

**What does NOT belong here (NEVER add these):**
- `sourcematerials/` - User presentation data goes in TARGET project, not here
- `dist/` - Build output goes in TARGET project, not here
- User-generated content of any kind
- Other skills or unrelated tools

**Skill Folder vs Target Folder:**
- **Skill folder** (this repo): Contains only the skill definition and template code
- **Target folder** (your cloned site): Where you run the skill, extract PPTX, build, and deploy

When you run `/pptx-to-handout`, all commands execute in your current working directory (the target folder). The skill reads its instructions from the symlinked skill folder but writes all output to your target folder.

If you're building a handout site, **clone this repo** as your starting point. If you want to use the skill in an existing project, **symlink to this repo** (see "Installing the Skill" above).

## Contributing

Contributions are welcome! Please see [CHANGELOG.md](CHANGELOG.md) for version history and release notes.

## License

MIT
