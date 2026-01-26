---
name: pptx-to-handout
description: >
  Convert PowerPoint presentations into interactive React handout websites with
  slide viewer, resources page, and one-click deployment. Use this skill when users
  want to: (1) Create a web-based handout from a PPTX file, (2) Generate an interactive
  slide viewer site, (3) Extract and publish presentation content as a deployable website,
  (4) Build a conference handout page with speaker info and resources. Triggers on:
  "convert pptx to website", "create handout site", "presentation handout", "pptx handout",
  "slide website", "/pptx-to-handout".
---

# PPTX to Handout Site

Convert PowerPoint presentations into interactive React handout websites.

## Usage

```
/pptx-to-handout <path-to-pptx-or-sourcematerials-folder>
```

## Core Principles

1. **Analyze first, ask second** - Understand the content before asking questions
2. **Show what you found** - Summarize detected info, then ask for corrections/additions
3. **Require local preview** - User must see the site locally before deployment
4. **Never auto-deploy** - Deployment requires explicit user approval after preview

---

## Workflow

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

**DO NOT ask about things you can confidently infer from the presentation.**

### Step 5: Generate entities.json

Create `src/data/entities.json` with extracted entities from your Step 3 analysis.

**See [references/entities-format.md](references/entities-format.md) for the full schema.**

Entity types to extract:
- **people** - Names mentioned, their roles, which slides reference them
- **quotes** - Attributed statements with source info
- **organizations** - Companies, institutions mentioned
- **tools** - Software, AI tools, products discussed
- **terms** - Technical terms with brief definitions
- **dates** - Significant dates and what happened
- **images** - Descriptions and categories for each image

**CRITICAL - URL Extraction:**
- URLs often split across lines in presentations
- ALWAYS reconstruct complete URLs from context
- VALIDATE each URL makes semantic sense
- If uncertain, ask the user to confirm

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
python scripts/analyze-existing-images.py . --backend lmstudio --model "llava-v1.6-mistral"
python scripts/analyze-existing-images.py . --backend ollama --model "llava:13b"
python scripts/analyze-existing-images.py . --backend gemini
```

The script updates `src/data/presentation.json` with image descriptions, categories, and extracted quotes.

**If user skips:** Let them know they can run it later with:
```bash
python scripts/image-review-server.py .  # Interactive review UI
python scripts/analyze-existing-images.py .  # Batch processing
```

### Step 6: Generate sessionInfo.ts

Create `src/data/sessionInfo.ts` using:
- Information detected in Step 3
- User answers from Step 4

**See [references/customization.md](references/customization.md) for the full format.**

Fill in all fields you have data for. Leave optional fields empty (`""` or `[]`) if not applicable.

### Step 7: Build and Local Preview

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
- ffmpeg (optional, for video compression on Cloudflare)

## References

- [Entities Format](references/entities-format.md) - JSON schema and image categories
- [Customization](references/customization.md) - Colors, fonts, sessionInfo, file structure
- [Troubleshooting](references/troubleshooting.md) - Common issues and fixes
