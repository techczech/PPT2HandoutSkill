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
/pptx-to-handout [path-to-pptx-or-json-folder]
```

## Workflow Principles

- **ASK, don't assume** - Confirm before significant decisions
- **Show, then ask** - Summarize results and ask before proceeding
- **Never deploy without explicit user approval**

## Workflow

### Step 1: Gather Information

Use AskUserQuestion to collect upfront:

1. **Project name** - Site identifier (e.g., "ai-workshop-2026")
2. **Presentation title** - Main title for the site
3. **Presenter name and profile link** - Full name + URL
4. **Input type**:
   - Pre-extracted JSON (`presentation.json` + `media/` folder)
   - Raw PPTX file (needs extraction)
   - Start fresh (clone template only)
5. **Deployment target**: Cloudflare Pages (25MB limit) or Vercel

### Step 2: Extract Content (if PPTX)

```bash
pip install python-pptx
python scripts/extract-pptx.py <input.pptx> sourcematerials/
```

**Limitations:** SmartArt exported as images, animations ignored, some formatting simplified.

### Step 3: Analyze Content for Entities

Read `sourcematerials/presentation.json` and create `src/data/entities.json` with AI-extracted entities: people, quotes, organizations, tools, terms, dates, images.

**See [references/entities-format.md](references/entities-format.md) for the full schema and image categories.**

**CRITICAL - URL Extraction:**
- **DO NOT blindly extract text that looks like URLs**
- URLs often split across lines in presentations (e.g., "techczech." on one line, "net" on the next)
- **ALWAYS reconstruct the complete URL from context**
- **VALIDATE each URL** - check if it makes semantic sense
- If uncertain, ask the user to confirm

**Optional batch image analysis:**
```bash
pip install google-genai pillow
export GEMINI_API_KEY="your-key"
python scripts/analyze-existing-images.py /path/to/site  # Uses Gemini 3 Flash Preview
```

### Step 4: Generate sessionInfo.ts

Create `src/data/sessionInfo.ts` using info from Step 1.

**See [references/customization.md](references/customization.md) for the full format and example.**

### Step 5: Build

```bash
npm run build
```

This copies media to `public/assets/`, auto-compresses large videos (if ffmpeg available), and builds the React app.

### Step 6: Preview

```bash
npm run dev
```

Guide user to verify: slides render, images/videos display, navigation works, Resources page shows correct entities.

### Step 7: Deploy (Optional)

**Vercel:**
```bash
vercel --prod --yes
```

**Cloudflare Pages:**
```bash
wrangler pages deploy dist --project-name=<project-name>
```

## Template Repository

Clone for new projects:
```bash
git clone https://github.com/techczech/PPT2HandoutSkill my-handout
cd my-handout
npm install
```

## Requirements

- Node.js 18+
- Python 3.8+ with python-pptx (`pip install python-pptx`)
- ffmpeg (optional, for video compression on Cloudflare)

## References

- [Entities Format](references/entities-format.md) - JSON schema and image categories
- [Customization](references/customization.md) - Colors, fonts, sessionInfo, file structure
- [Troubleshooting](references/troubleshooting.md) - Common issues and fixes
