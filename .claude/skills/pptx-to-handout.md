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

## Workflow Principles

**User Interaction Philosophy:**
- **ASK, don't assume** - Always confirm before making significant decisions
- **Show, then ask** - After completing extraction or generation steps, show the user a summary and ask for confirmation before proceeding
- **Validate critical data** - URLs, names, titles should be confirmed with user if there's any ambiguity
- **Regular check-ins** - After each major step (extraction, entity generation, build), ask user if they want to review or proceed
- **Never deploy without explicit user approval** - Always ask before deploying to production

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

### Step 4: Analyze Content for Entities

**IMPORTANT:** This step replaces mechanical regex-based extraction with AI model understanding.

**User Interaction:** After completing entity extraction, show the user a summary of what was found (counts of people, quotes, tools, etc.) and ask if they'd like to review any category before proceeding.

Read through `src/data/presentation.json` (or `sourcematerials/presentation.json` if not yet processed) and create `src/data/entities.json` with semantically extracted entities:

#### People
- Scan all slide titles, content, and notes for people mentioned
- Look for: names in titles, attributed quotes, speaker names, people shown in images
- Include their role/affiliation if mentioned
- Track which slides mention them

#### Quotes
- A quote is a statement attributed to a specific person or source
- Quotes may appear:
  - As text on the slide itself (check slide content)
  - In speaker notes
  - In images (tweets, messages, book excerpts)
- **Do NOT treat random text in images as quotes**
- Include: full quote text, attribution, source type, date if available

#### Images
- For images, provide a rich description including:
  - What type of content it is (tweet, chart, photo, screenshot, diagram)
  - Any people shown or mentioned
  - Date/time if visible
  - Source if identifiable
- If image contains a quote, reference it (don't duplicate the text)
- Assign a **category** to each image from:
  - `cartoon` - Illustrations, drawings, comics, memes with drawn characters
  - `interface_screenshot` - Software UI, app interfaces, website screenshots
  - `chat_screenshot` - Slack, Teams, Discord, or other chat app messages
  - `tweet` - Twitter/X posts
  - `quote` - Text-based quotes or blockquotes
  - `academic_paper` - Research paper pages, citations, abstracts
  - `diagram` - Technical diagrams, flowcharts, architecture diagrams
  - `chart` - Data visualizations, graphs, bar charts, line charts
  - `photo_person` - Photographs of people
  - `book_cover` - Book covers, ebook covers
  - `product_page` - E-commerce or product listing pages
  - `other` - Anything that doesn't fit above categories

#### Organizations
- Identify companies, institutions, research groups mentioned
- Note their context (product maker, research source, etc.)

#### Dates & Events
- Extract significant dates mentioned
- Include what happened on that date

#### Tools & Products
- Identify AI tools, products, services mentioned
- Include brief context of why mentioned

**CRITICAL - URL Extraction:**
- **DO NOT blindly extract text that looks like URLs**
- Many URLs split across lines in presentations (e.g., "ltvibes.tech" on one line, "czech.net" on the next)
- **ALWAYS consider full context** - read surrounding text to reconstruct the complete URL
- **VALIDATE each URL** before adding:
  1. Check if the URL makes semantic sense (techczech.net makes sense, czech.net alone doesn't)
  2. Verify the URL format is complete (has protocol or full domain)
  3. If uncertain, ask the user to confirm the URL
- Common patterns:
  - Website shown on slide with line breaks: "https://example.com/path" might appear as "example.com/" then "path"
  - Email addresses: "user@domain." then "com" on next line
- Extract the INTENDED URL, not the visually split version
- If you can't determine the complete URL, mark it for user review

#### Terms
- Identify key technical terms used
- Include brief definitions

#### entities.json Format

```json
{
  "people": [
    {
      "name": "Person Name",
      "role": "Role or affiliation",
      "mentions": [
        { "slideIndex": 6, "context": "Slide title mentions them" }
      ]
    }
  ],
  "organizations": [...],
  "quotes": [
    {
      "text": "The actual quote text...",
      "attribution": "Person Name",
      "source": "Tweet, November 30, 2022",
      "slideIndex": 9
    }
  ],
  "tools": [...],
  "terms": [...],
  "dates": [...],
  "images": [
    {
      "src": "/assets/images/slides/slide_9_5.png",
      "description": "Screenshot of a tweet from Sam Altman...",
      "slideIndex": 9,
      "category": "tweet",
      "containsQuote": true
    }
  ]
}
```

The Resources page will read from this file instead of using regex patterns.

#### Optional: Batch Image Analysis Scripts

For presentations with many images, two scripts are available:

**1. analyze-existing-images.py** - Use Gemini AI to generate descriptions and categories

**CRITICAL:** This script MUST use **Gemini 3 Flash Preview** (`gemini-3-flash-preview`) model. DO NOT use Gemini 2.0 models.

```bash
pip install google-genai pillow  # NOTE: google-genai, NOT google-generativeai
export GEMINI_API_KEY="your-key"
python scripts/analyze-existing-images.py /path/to/site
```
- Analyzes images using Gemini 3 Flash Preview vision AI
- Generates descriptions with context (e.g., "Tweet by X on Y date")
- Assigns categories to each image from the predefined list
- Extracts quotes from tweets, screenshots, and text images
- Tracks token usage and creates `processingStats.json`
- Updates `presentation.json` with image metadata in-place

**2. categorize-from-descriptions.py** - Categorize without API calls
```bash
python scripts/categorize-from-descriptions.py /path/to/site
```
- Uses keyword matching on existing descriptions
- No API costs - runs locally
- Useful when descriptions exist but categories are missing
- Pattern-based detection (e.g., "tweet" in description → `tweet` category)

### Step 5: Generate sessionInfo.ts

Use the information collected in Step 1 plus any additional details to create `src/data/sessionInfo.ts`:
- Use the presenter name and profile link from Step 1
- Use the presentation title from Step 1
- Fill in other details (affiliation, email, bio, event info, abstract)
- If information is missing, use reasonable defaults or ask for critical fields only

### Step 6: Process Media

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

### Step 7: Preview and Review

Start the development server for user review:

```bash
npm run dev
```

Guide user to check:
- All slides render correctly
- Images and videos display properly
- Navigation works (arrow keys, click)
- Mobile responsiveness
- **Resources page shows correct entities** (people, quotes, tools, dates)

### Step 8: Deploy (Optional)

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
│   │   ├── entities.json      # AI-extracted entities (generated by Step 4)
│   │   ├── processingStats.json # AI analysis stats (optional)
│   │   ├── sessionInfo.ts     # Session metadata (customize)
│   │   └── types.ts           # TypeScript types
│   ├── components/            # React components (don't modify)
│   ├── pages/                 # Page components (don't modify)
│   ├── utils/
│   │   └── extractResources.ts # Reads from entities.json
│   └── index.css              # Styles (customize colors)
├── public/assets/             # Static media (generated)
├── scripts/
│   ├── processMedia.js        # Build-time processor
│   ├── extract-pptx.py        # PPTX extractor
│   ├── analyze-existing-images.py  # AI image analysis (Gemini)
│   └── categorize-from-descriptions.py # Local categorization
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
