# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PPT2Handout converts PowerPoint presentations into interactive React handout websites. The system extracts slides, media, and metadata from PPTX files, then generates a deployable static site with slide navigation, search, and resource extraction.

## Common Commands

```bash
# Development
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # Process media + TypeScript compile + Vite build
npm run lint         # ESLint with strict settings

# PPTX Extraction (requires python-pptx)
pip install python-pptx
python scripts/extract-pptx.py <input.pptx> sourcematerials/

# Deployment
npx wrangler pages deploy dist --project-name=<name>  # Cloudflare Pages
npx vercel --prod                                      # Vercel
```

## Build Pipeline

`npm run build` executes three steps:
1. **`scripts/processMedia.js`** - Copies media from `sourcematerials/media/{uuid}/` to `public/assets/`, auto-compresses videos >25MB (requires ffmpeg), transforms paths in presentation.json
2. **`tsc`** - TypeScript compilation
3. **`vite build`** - Production bundle to `dist/`

Media files are organized by type:
- `sa_*.png/jpg` → `/assets/images/icons/` (SmartArt icons)
- Other images → `/assets/images/slides/`
- `.mp4` → `/assets/videos/`

## Architecture

### Data Flow
```
sourcematerials/presentation.json  →  processMedia.js  →  src/data/presentation.json
sourcematerials/media/{uuid}/      →  processMedia.js  →  public/assets/
```

### Key Files to Customize
- `src/data/sessionInfo.ts` - Presentation metadata (title, speaker, event details)
- `src/index.css` - CSS variables for colors and fonts
- `src/data/entities.json` - AI-extracted entities (people, quotes, tools) for Resources page

### Core Types (`src/data/types.ts`)
- `Presentation` - Root type containing sections and metadata
- `Section` - Named group of slides
- `Slide` - Individual slide with order, title, layout, notes, content
- `ContentBlock` - Union type: `HeadingContent | ListContent | ImageContent | SmartArtContent | VideoContent`
- `FlatSlide` - Slide with navigation metadata (globalIndex, sectionIndex)

### Page Structure
| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | HomePage | Session info, speaker bio, abstract |
| `/slides/:n` | SlidesPage | Slide viewer with navigation |
| `/resources` | ResourcesPage | Extracted entities from entities.json |
| `/media-gallery` | MediaGalleryPage | Filterable image/video grid |
| `/about` | AboutPage | Presentation stats |

### Navigation System
- `useNavigation` hook manages slide index and section jumping
- `useKeyboard` handles arrow keys, space, home/end for slide navigation
- `useGlobalKeyboard` handles `/` for search, `?` for help across all pages
- `useSearch` provides full-text search across slides, notes, and content

## Claude Code Skill

This repo includes a `/pptx-to-handout` skill (`.claude/skills/pptx-to-handout/SKILL.md`) that guides users through:
1. Analyzing PPTX content and summarizing findings
2. Asking clarifying questions based on what was detected
3. Generating entities.json and sessionInfo.ts
4. Local preview with feedback loop
5. Deployment (only on explicit approval)

## Image Analysis Scripts

For AI-powered image description, two modes are available:

### Interactive Review UI (Recommended)

```bash
python scripts/image-review-server.py /path/to/site
```

Opens a web UI at http://localhost:8765 where you can:
- Select backend and model from available options
- Choose which images to analyze
- Review and edit AI-generated descriptions
- Approve results before saving

### Batch Processing

```bash
# List available backends and models
python scripts/analyze-existing-images.py --list

# Auto-detect best available backend (LM Studio > Ollama > Gemini)
python scripts/analyze-existing-images.py /path/to/site

# Use specific backend
python scripts/analyze-existing-images.py /path/to/site --backend lmstudio --model "llava-v1.6"
python scripts/analyze-existing-images.py /path/to/site --backend ollama --model "llava:13b"
python scripts/analyze-existing-images.py /path/to/site --backend gemini
```

**Backends (in priority order):**
- **LM Studio** - Local server at localhost:1234 (OpenAI-compatible API)
- **Ollama** - Local server at localhost:11434 (auto-filters for vision models)
- **Gemini** - Cloud API (requires `GEMINI_API_KEY` or `GOOGLE_API_KEY`)

For Gemini, install: `pip install google-genai pillow`

## Content Types

The presentation.json content array supports:
- `heading` - Text with level (1-6), optional `runs` for formatting
- `list` - Bullet or numbered with nested items, optional `runs` for formatting
- `image` - With optional AI-generated description, quote_text, category
- `smart_art` - Hierarchical nodes with icons
- `video` - MP4 files
- `shape` - Auto shapes (arrows, connectors, symbols)

## Text Formatting

Text items (headings, list items) may include a `runs` array when formatting is present:
```json
{
  "text": "This is bold text",
  "runs": [
    {"text": "This is "},
    {"text": "bold", "bold": true},
    {"text": " text"}
  ]
}
```

Run properties:
- `bold`, `italic`, `underline`: Boolean formatting flags
- `url`: Hyperlink URL if present
- `font_color`: Hex color (e.g., "FF0000")

## Shape Extraction

Meaningful shapes (arrows, connectors, symbols like ≠, +, -, etc.) are extracted:
```json
{
  "type": "shape",
  "shape_type": "math_not_equal",
  "shape_name": "Not Equal 2",
  "fill_color": "C00000",
  "position": {"left": 100, "top": 200, "width": 50, "height": 50},
  "animation_order": 1
}
```

Shape properties:
- `shape_type`: Auto shape type (e.g., "right_arrow", "math_not_equal")
- `shape_name`: PowerPoint shape name
- `position`: {left, top, width, height} in EMUs
- `fill_color`, `line_color`: Hex colors
- `rotation`: Angle in degrees
- `animation_order`: Entry order in slide animations (1-based)
- `text`, `runs`: Text content inside the shape if any

## Cloudflare Pages Considerations

- 25MB file size limit - videos over this are auto-compressed during build
- Install ffmpeg for automatic compression: `brew install ffmpeg` (macOS)
