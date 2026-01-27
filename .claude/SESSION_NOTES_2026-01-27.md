# Session Notes: 2026-01-27 - Vibecoding as Pedagogy Build + Skill Sync

## Summary

Built handout site for "Vibecoding as Pedagogy" PPTX and synced all improvements back to PPT2HandoutSkill template. Several bugs discovered and fixed during the process.

---

## Critical Issues Discovered & Fixed

### 1. MediaGalleryPage reads descriptions from wrong source

**Problem:** MediaGalleryPage loaded image descriptions from `entities.json` images array (which was empty), ignoring descriptions stored directly on image blocks in `presentation.json` by the `analyze-existing-images.py` script.

**Root cause:** The page had `import entitiesData` and used `entityImages.find(ei => ei.src === media.src)` to look up descriptions, but the analysis script writes descriptions to `src/data/presentation.json` on each image's `description` and `category` fields.

**Fix:** Removed entities.json dependency. Now reads `media.description` and `media.category` directly from presentation.json image blocks.

**Files:** `src/pages/MediaGalleryPage.tsx`

### 2. Standard PowerPoint layout names not mapped

**Problem:** `getLayoutCategory()` in `slideHelpers.ts` only recognized custom layout names from the aiforresearch PPTX (e.g., `"Sidebar title without text"`, `"Video with description"`). Standard PowerPoint layouts like `"Two Content"` fell through to the default `content` category, rendering all two-column slides as plain content instead of sidebar layouts.

**Root cause:** The aiforresearch PPTX had custom slide layout names that mapped naturally to component categories. Standard PPTXs use generic names like `"Two Content"`, `"Title Only"`, `"Title and Content"`.

**Fix:** Added `lowerLayout === 'two content'` to the sidebar detection condition.

**Files:** `src/utils/slideHelpers.ts`

**TODO:** More standard layout mappings may be needed for other PPTXs. Consider adding:
- `"comparison"` → sidebar
- `"picture with caption"` → media
- `"blank"` → title (or content)

### 3. ToolResource type missing category field

**Problem:** TypeScript compilation errors when filtering tools by `category` on HomePage because `ToolResource` interface didn't have a `category` field.

**Fix:** Added `category?: string` and `slideIndex?: number` to `ToolResource` in `types.ts`.

**Files:** `src/data/types.ts`

### 4. Video extraction missing from extract-pptx.py

**Problem:** The PPTX extraction script (`extract-pptx.py`) does not extract embedded videos. The vibecoding PPTX had 11 MP4 videos that were completely missing.

**Workaround:** Manually extracted videos with a Python script using `python-pptx` to find `a:videoFile` elements, get their relationship targets, and write blob data to files. Then manually added video content blocks to `sourcematerials/presentation.json`.

**TODO:** Fix `extract-pptx.py` to handle video extraction automatically. Videos are found via:
```python
from pptx.oxml.ns import qn
for shape in slide.shapes:
    videos = shape._element.findall('.//' + qn('a:videoFile'))
    for v in videos:
        rid = v.get(qn('r:link'))
        rel = slide.part.rels[rid]
        blob = rel.target_part.blob  # This is the MP4 data
```

### 5. Screenshot generation workflow

**Problem:** `soffice --convert-to png` only creates a single combined image, not one per slide.

**Fix:** Use PDF as intermediate: `soffice --convert-to pdf`, then `pdftoppm -png -r 150` to split pages into individual PNGs. Rename from `slide-001.png` to `slide_0001.png` format.

**TODO:** Document this in the skill or add a script for it.

### 6. LM Studio model name

**Problem:** Used wrong model `qwen2.5-vl-7b-instruct` which gave HTTP 400 errors.

**Fix:** Correct model is `qwen/qwen3-vl-4b`. Updated SKILL.md with recommended model.

### 7. Wrong working directory for dev server

**Problem:** `npm run dev` ran from aiforresearch directory instead of vibecoding-as-pedagogy because the shell cwd kept resetting.

**Lesson:** Always verify which project the dev server is running from with `lsof -p <pid> | grep cwd` before telling the user to check.

---

## Changes Made to PPT2HandoutSkill Template

### New Files
| File | Purpose |
|------|---------|
| `src/components/content/OutlineView.tsx` | Hierarchical outline view with slide navigation |
| `src/components/slides/FinalSlide.tsx` | "Thank you" / final slide with gradient background |
| `src/components/slides/LicenseSlide.tsx` | Creative Commons license slide |
| `src/hooks/useSlideViewMode.tsx` | Hook for content/screenshot/outline toggle (`v` key) |
| `src/pages/GridPage.tsx` | Thumbnail grid view of all slides (`d` key) |
| `src/utils/screenshotMapping.ts` | Maps slide numbers to screenshot file numbers |

### Modified Files
| File | Changes |
|------|---------|
| `src/pages/MediaGalleryPage.tsx` | Complete rewrite: colored category pills, keyboard nav, lightbox with prev/next/counter, descriptions from presentation.json |
| `src/pages/HomePage.tsx` | Prominent abstract, Index & Glossary Preview with people/quotes/tools/terms/dates |
| `src/utils/slideHelpers.ts` | Added `"two content"` → sidebar mapping |
| `src/data/types.ts` | Added `category`/`slideIndex` to ToolResource, `description`/`category` to ImageContent |
| `src/App.tsx` | Added `/outline` redirect route, `/grid` route |
| `src/components/layout/SlideContainer.tsx` | View mode toggle, grid button |
| `src/components/slides/SlideRenderer.tsx` | Added FinalSlide, LicenseSlide routing |
| `src/components/slides/TitleSlide.tsx` | Intro slide layout (QR + title box), statement slides, SmartArt-only title |
| `src/components/slides/ContentSlide.tsx` | Enhanced content rendering |
| `src/components/slides/MediaSlide.tsx` | Unified media gallery |
| `src/components/slides/QuoteSlide.tsx` | Enhanced quote display |
| `src/components/content/SmartArtDiagram.tsx` | 11 layout patterns, icon color preservation |
| `src/hooks/useKeyboard.ts` | View mode cycling, grid shortcut |
| `src/pages/SlidesPage.tsx` | View mode provider integration |
| `src/index.css` | Sans-serif fonts (not serif) |
| `src/utils/extractResources.ts` | Updated resource extraction |

### Skill Documentation
| File | Changes |
|------|---------|
| `SKILL.md` | Updated image analysis model to `qwen/qwen3-vl-4b`, added view mode instructions for preview |
| `references/entities-format.md` | Added link types, quote fields (extractedFromImage, topic) |
| `references/customization.md` | Updated sessionInfo example with keyTopics, featuredLinks, abstract guidance |

---

## Remaining TODOs for Future Sessions

1. **Fix extract-pptx.py to extract videos** - Currently skips all embedded MP4s
2. **Add screenshot generation to workflow** - Either as a script or documented in SKILL.md (soffice → pdf → pdftoppm)
3. **More standard layout mappings** - `"Comparison"`, `"Picture with Caption"`, etc.
4. **Homepage "Tools Mentioned" section** - Currently vibecoding-specific; make it generic in template (show vibecoded category tools as clickable cards when they exist)
5. **Extraction script records wrong layout names** - `"Title Slide - Image Background"` was recorded as `"Title and Content"` in vibecoding extraction
6. **processMedia.js preserves descriptions** - The build script correctly preserves AI-generated descriptions when rebuilding, but only for images. Verify it handles video descriptions too.
7. **ImageGallery.tsx vs MediaGallery.tsx** - Both exist in aiforresearch. ImageGallery is image-only (older). Consider removing ImageGallery and using only MediaGallery.

---

## Vibecoding-as-Pedagogy Site Details

- **URL:** https://vibecoding-as-pedagogy.pages.dev
- **Project dir:** `/Users/dominiklukes/gitrepos/ppt-tools/ppt-handout-webs/vibecoding-as-pedagogy`
- **Slides:** 131 slides, 54 sections
- **Media:** 64 images (all AI-described with qwen/qwen3-vl-4b), 11 videos (1 compressed from 33MB to 18MB)
- **Screenshots:** 131 generated via LibreOffice + pdftoppm
- **Deployment:** Cloudflare Pages
- **Layout names in PPTX:** `Title Only` (53), `Two Content` (47), `Title and Content` (30), `Title Slide - Image Background` (1)
