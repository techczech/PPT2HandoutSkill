---
name: PPT2HandoutSkill
description: >
  Convert PowerPoint presentations into interactive React handout websites with
  slide viewer, resources page, and one-click deployment. Use this skill when users
  want to: (1) Create a web-based handout from a PPTX file, (2) Generate an interactive
  slide viewer site, (3) Extract and publish presentation content as a deployable website,
  (4) Build a conference handout page with speaker info and resources. Triggers on:
  "convert pptx to website", "create handout site", "presentation handout", "pptx handout",
  "slide website", "/PPT2HandoutSkill".
---

> **Canonical Location:** This skill lives at [github.com/techczech/PPT2HandoutSkill](https://github.com/techczech/PPT2HandoutSkill).
> To install in other projects, symlink this repository to `.claude/skills/PPT2HandoutSkill`.
>
> **IMPORTANT:** Never put `sourcematerials/` or user content in this skill folder.
> All extraction and generated content goes in the TARGET project folder (your cloned handout site), not here.

# PPTX to Handout Site

Convert PowerPoint presentations into interactive React handout websites.

## Usage

```
/PPT2HandoutSkill <path-to-pptx-or-sourcematerials-folder>
```

## Core Principles

1. **Analyze first, ask second** - Understand the content before asking questions
2. **Show what you found** - Summarize detected info, then ask for corrections/additions
3. **Require local preview** - User must see the site locally before deployment
4. **Never auto-deploy** - Deployment requires explicit user approval after preview

---

## Workflow

> **Working Directory:** All commands run in the TARGET project folder (your cloned handout site),
> NOT in the skill folder. The skill folder contains only the skill definition.
> If starting fresh, first clone the template (see "Setting Up a New Project" below).

### Step 1: Determine Input Type

Check what the user provided:

- **PPTX file** → Go to Step 2 (extraction)
- **Folder with `presentation.json`** → Skip to Step 3 (already extracted)
- **Nothing specified** → Check if `sourcematerials/presentation.json` exists in current directory

If no valid input found, ask the user to provide a PPTX file path or a folder containing extracted content.

### Step 2: Extract PPTX Content

If input is a PPTX file:

```bash
pip install python-pptx  # if not already installed
python scripts/extract-pptx.py <input.pptx> sourcematerials/
```

**After extraction, summarize what was extracted:**
- Number of slides
- Number of images/videos found
- Any extraction warnings

**Limitations to mention:** SmartArt exported as images, animations ignored, some formatting simplified.

### Step 2b: Generate Slide Screenshots

Always generate slide screenshots from the PPTX file. These provide a faithful visual representation of each slide and are essential for the screenshot/content toggle feature.

**Requirements:** LibreOffice and poppler (pdftoppm). On macOS:
```bash
brew install --cask libreoffice  # if not installed
brew install poppler              # if not installed
```

**Generate screenshots:**
```bash
python scripts/generate-screenshots.py <input.pptx> sourcematerials
```

This creates `sourcematerials/screenshots/screenshot_1.png` through `screenshot_N.png`. The `processMedia.js` build step will copy these to `public/assets/screenshots/` automatically.

**IMPORTANT:** Screenshots are generated per-presentation and must NOT be committed to the template repo. They are listed in `.gitignore` under `public/assets/screenshots/`. Each new presentation generates its own screenshots during this step.

### Step 3: Analyze Presentation Content

Read `sourcematerials/presentation.json` and analyze the content. Extract:

1. **Detected metadata:**
   - Presentation title (from first slide or metadata)
   - Speaker name (if found in slides)
   - Any dates, event names, or affiliations mentioned

2. **Content summary:**
   - Total slide count and section breakdown
   - Key topics/themes identified
   - Notable people, organizations, tools mentioned
   - Quotes found (with attributions)

3. **Media inventory:**
   - Count of images by type (photos, screenshots, diagrams, etc.)
   - Videos found and their sizes

4. **Extraction quality assessment:**
   - Count slides where content is mostly images/shapes with little or no extracted text
   - Count empty decorative shapes (rectangles, ovals, arcs without text)
   - Note if a high proportion of slides have limited text extraction (flag as "limited extraction")
   - This assessment informs whether to suggest screenshot-primary mode in Step 4

**Present this summary to the user before proceeding.**

### Step 4: Ask Clarifying Questions

Based on your analysis, use `AskUserQuestion` to gather missing or uncertain information:

**Always ask about:**
1. **Project name** - URL-friendly identifier for deployment (suggest one based on title)
2. **Deployment target** - Cloudflare Pages (25MB file limit) or Vercel

**Ask only if not detected or uncertain:**
- Presentation title (if unclear from slides)
- Speaker name and profile URL
- Speaker bio (brief paragraph)
- Event details (name, date, location) if this is for a conference
- Any corrections to detected information

**If extraction appears limited** (many image-heavy slides, decorative shapes, sparse text):
3. **Screenshot-primary mode?** — The extraction captured limited text content from these slides. Would you like to use screenshot-primary mode? This makes the original slide screenshots the default view, renames the text view to "Slide Text", and hides empty decorative shapes.

> The user can always choose screenshot-primary mode regardless of detection — the analysis just determines whether to proactively suggest it.

**DO NOT ask about things you can confidently infer from the presentation.**

### Step 5: Generate entities.json

Create `src/data/entities.json` with extracted entities from your Step 3 analysis.

**See [references/entities-format.md](references/entities-format.md) for the full schema.**

Entity types to extract:

- **people** - Names mentioned with their roles and slideIndex
- **quotes** - Attributed statements with:
  - `attribution` - Who said it and source
  - `topic` - Category tag (ai_technology, learning, ai_ethics, etc.)
  - `extractedFromImage` - true if quote was in an image
- **organizations** - Companies, institutions with descriptions
- **tools** - Software, AI tools with:
  - `description` - What the tool does
  - `url` - Link to the tool (if available)
  - `category` - chatbot, research, development, productivity
- **terms** - Technical terms with definitions
- **dates** - Significant dates with events and slideIndex
- **links** - URLs with:
  - `title` - Human-readable link title
  - `description` - What the link contains
  - `linkType` - tool, demo, article, documentation, research, personal, website

**CRITICAL - URL/Link Extraction (AI-Only, Semantic Approach):**

Links are NOT extracted mechanically via regex. The AI must:
1. **Read and understand** each slide's content contextually
2. **Identify meaningful URLs** - not just strings that look like URLs
3. **Reconstruct fragmented URLs** - presentations often split URLs across lines
4. **Provide semantic descriptions** - explain what the link leads to
5. **Classify by type** - tool, demo, article, documentation, research, personal, website
6. **Validate purpose** - only include links relevant to the presentation topic

DO NOT rely on pattern matching. READ the slides, understand the context, and extract links that would be useful to the audience.

If uncertain about a URL, ask the user to confirm.

### Step 5b: AI Image Categorization (Optional)

If the presentation has images, ask the user if they want to run AI-powered image analysis to generate descriptions and categories.

**First, detect available backends:**
```bash
python scripts/analyze-existing-images.py --list --json
```

This returns available backends and models:
- **lmstudio** - Local LM Studio server (localhost:1234) with vision models
- **ollama** - Local Ollama server (localhost:11434) with vision models (llava, etc.)
- **gemini** - Cloud Gemini API (requires GEMINI_API_KEY)

**Use `AskUserQuestion` to ask:**

1. **Run image categorization?**
   - **Yes, with review UI** - Launch web interface to review results before saving
   - **Yes, batch process all** - Process all images automatically
   - **Skip for now** - Can do later

2. **If yes, which backend?** - Show only available backends from --list output
3. **Which model?** - Show models available for the selected backend

**Option A: Review UI (Recommended)**

Launch the review server for interactive image analysis:
```bash
python scripts/image-review-server.py .
```

This opens a web UI at http://localhost:8765 where the user can:
- Select which images to analyze
- Choose backend and model from dropdowns
- Review and edit AI-generated descriptions before saving
- Approve results individually or in batch

Tell the user:
> The image review UI is running at http://localhost:8765
>
> In the UI you can:
> 1. Select a backend and model from the dropdowns
> 2. Check the images you want to analyze
> 3. Click "Analyze Selected" to process them
> 4. Review and edit the results
> 5. Click "Approve" on each result (or "Approve All")
> 6. Click "Save & Exit" when done
>
> Press Ctrl+C in the terminal when finished.

**Option B: Batch Processing**

For automatic processing without review:
```bash
# With auto-detection (uses LM Studio > Ollama > Gemini priority)
python scripts/analyze-existing-images.py .

# Or with specific backend/model
python scripts/analyze-existing-images.py . --backend lmstudio --model "qwen/qwen3-vl-4b"
python scripts/analyze-existing-images.py . --backend ollama --model "llava:13b"
python scripts/analyze-existing-images.py . --backend gemini
```

**Recommended LM Studio models:**
- `qwen/qwen3-vl-4b` - Fast, good quality for most images (recommended)
- `llava-v1.6-mistral` - Alternative if Qwen unavailable

The script updates `src/data/presentation.json` with image descriptions, categories, and extracted quotes.

**If user skips:** Let them know they can run it later with:
```bash
python scripts/image-review-server.py .  # Interactive review UI
python scripts/analyze-existing-images.py .  # Batch processing
```

### Step 6: Generate sessionInfo.ts

Create `src/data/sessionInfo.ts` using information from Step 3 analysis and Step 4 user answers.

**Key fields to populate for a good homepage:**

1. **Required fields:**
   - `title` - Presentation title
   - `subtitle` - Brief tagline or event context
   - `speaker.name`, `speaker.affiliation`, `speaker.email`

2. **Abstract (highly recommended):**
   - Write a compelling 2-4 paragraph abstract based on the presentation content
   - Use `\n\n` for paragraph breaks
   - This is displayed prominently on the homepage (NOT collapsed)

3. **Key Topics (recommended):**
   - Extract 4-8 key topics from the presentation
   - Write as actionable bullet points
   - Displayed as a bullet list on the homepage

4. **Featured Links (optional but valuable):**
   - Include 2-4 key tools or resources mentioned prominently in the presentation
   - Give each a descriptive name and brief description
   - These appear as clickable cards on the homepage

5. **Talk Page Link (optional):**
   - If there's a booking page, event page, or talk recording, add to `talkPageUrl`
   - Set `talkPageLabel` to something like "Book this workshop" or "Watch Recording"

**See [references/customization.md](references/customization.md) for the full format.**

Fill in all fields you have data for. Leave optional fields empty (`""` or `[]`) if not applicable.

### Step 7: Build and Local Preview

**If screenshot-primary mode was selected in Step 4, apply these changes before the first build:**

1. **Set default display mode to screenshot** in `src/hooks/useSlideViewMode.tsx`:
   - Change `useState<DisplayMode>('rendered')` → `useState<DisplayMode>('screenshot')`

2. **Rename "Web View" to "Slide Text"** in these files:
   - `src/components/layout/SlideContainer.tsx` — toggle button label (e.g., "Switch to Slide Text" / "Switch to Screenshot")
   - `src/components/content/GridView.tsx` — grid toolbar label (e.g., "Slide Text" / "Screenshots")
   - `src/components/PrintModal.tsx` — export option label
   - `src/components/KeyboardShortcutsModal.tsx` — shortcut description (e.g., "Toggle slide text/screenshot mode")

3. **Filter empty decorative shapes** in `src/components/content/ContentRenderer.tsx`:
   - In the `'shape'` case, skip shapes that have no `text` property:
     ```tsx
     case 'shape': {
       const shape = content as ShapeContent;
       if (!(shape as ShapeContent & { text?: string }).text?.trim()) return null;
       return <ShapeBlock content={shape} />;
     }
     ```

```bash
npm run build  # Process media + compile + bundle
npm run dev    # Start dev server
```

**Tell the user:**
> The site is running at http://localhost:5173
>
> Please check:
> - Home page shows correct title, speaker info, and abstract
> - Slides page renders all slides with images/videos
> - **Press `v` to cycle between content/screenshot/outline views**
> - **Press `d` to open grid view of all slides**
> - Navigation works (arrows, keyboard)
> - Resources page shows extracted entities
> - Media Gallery displays images correctly

**STOP and wait for user feedback.** Do not proceed until user responds.

### Step 8: Iterate Based on Feedback

If user reports issues or wants changes:
1. Make the requested fixes
2. Rebuild if necessary (`npm run build`)
3. Ask user to check again
4. Repeat until user confirms it looks good

Common fixes:
- Adjusting sessionInfo.ts content
- Adding/removing entities
- Fixing image descriptions or categories

### Step 9: Deploy (Only on Explicit Approval)

**DO NOT deploy unless the user explicitly says to deploy** (e.g., "deploy it", "looks good, deploy", "ship it").

When user approves deployment:

**Vercel:**
```bash
vercel --prod --yes
```

**Cloudflare Pages:**
```bash
npm run build  # Ensure latest build
npx wrangler pages deploy dist --project-name=<project-name>
```

After deployment, provide the live URL to the user.

### Step 10: Add Lecture Notes (Optional)

If a transcript of the presentation is available (recording, MacWhisper export, SRT/VTT file, or plain text):

```
/LectureNotesSkill <path-to-transcript>
```

This generates narrative lecture notes from the transcript, mapped to presentation sections. The Notes link appears automatically in the nav bar once `lectureNotes.ts` is populated. The Notes link should appear **right after Slides** in the nav order (Home → Slides → Notes → ...). If the template places it elsewhere, move the `lectureNotes.length > 0` block in `src/components/layout/SiteHeader.tsx` to after the Slides link. See the [LectureNotesSkill](/LectureNotesSkill) for full details.

---

## Setting Up a New Project

If starting fresh (no existing handout project):

```bash
git clone https://github.com/techczech/PPT2HandoutSkill my-handout
cd my-handout
npm install
```

Then proceed with Step 1.

## Requirements

- Node.js 18+
- Python 3.8+ with python-pptx (`pip install python-pptx`)
- LibreOffice + poppler (for slide screenshot generation)
- ffmpeg (optional, for video compression on Cloudflare)

## Generated Assets (Not in Template)

The template ships clean — all presentation-specific files are gitignored and generated per-project:

- `sourcematerials/` — extracted PPTX content (JSON + media)
- `public/assets/images/slides/` — slide images (copied by processMedia.js)
- `public/assets/images/icons/` — SmartArt icons (copied by processMedia.js)
- `public/assets/screenshots/` — slide screenshots (from generate-screenshots.py)
- `public/assets/videos/` — presentation videos (copied by processMedia.js)

**Never commit these to the template repo.** Each presentation generates its own assets during the workflow.

## References

- [Entities Format](references/entities-format.md) - JSON schema and image categories
- [Customization](references/customization.md) - Colors, fonts, sessionInfo, file structure
- [Slide Types](references/slidetypes.md) - Layout detection and rendering rules
- [Troubleshooting](references/troubleshooting.md) - Common issues and fixes
