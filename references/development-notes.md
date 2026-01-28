# PPT Handout Skill Session Notes - January 24, 2026

## Session Overview
Rebuilt the AI for Research workshop handout site (`aiforresearch`) with new slides from `20260123_ai-for-research-one-day-workshop_ihyucq`.

## What Was Requested

### 1. Rebuild with New Slides
- Source: `/Users/dominiklukes/gitrepos/ppt-tools/my-ppt-repo/storage/20260123_ai-for-research-one-day-workshop_ihyucq`
- Target: `/Users/dominiklukes/gitrepos/ppt-tools/ppt-handout-webs/aiforresearch`

### 2. Extract and Display Activities
- Create dedicated Activities page (not on homepage)
- Extract activities from slide content (keywords: "activity", "try", "explore", "let's")
- Include proper tool links for each activity

### 3. Add Multiple Links per Activity
- Some activities need multiple tool links (e.g., Views from History AND MPI Explorer)
- Changed from single `tool`/`toolUrl` to `tools` array format

### 4. Sequential Activity Numbering
- Changed activity badges from slide numbers to sequential numbers (1-21)

### 5. Image Analysis with Vision Models
- Analyze all images to extract descriptions, categories, and quotes
- Add extracted quotes to entities.json

### 6. Add New Slide
- Added slide 336 "What to do with your Google AI Studio app"
- Screenshot from https://windows-vibe-guide.pages.dev/

---

## Issues Encountered & Solutions

### Issue 1: Wrong Source Data Being Used
**Problem:** The `processMedia.js` script reads from `sourcematerials/` folder, which had OLD presentation data (20260116) instead of the new one (20260123).

**Symptoms:** Sections and slides were from the old presentation even after copying new files.

**Solution:**
```bash
rm -rf sourcematerials
mkdir -p sourcematerials/media
cp /path/to/20260123_.../json/presentation.json sourcematerials/presentation.json
cp -r /path/to/20260123_.../media/... sourcematerials/media/
```

**Skill Update Needed:** The skill should verify that `sourcematerials/presentation.json` matches the expected presentation ID before building.

### Issue 2: Video Too Large for Cloudflare Pages
**Problem:** `slide_84_7.mp4` was 49.7MB, exceeding Cloudflare's 25MB limit.

**Solution:** The `processMedia.js` script automatically compresses videos over 25MB using ffmpeg:
```bash
ffmpeg -i input.mp4 -c:v libx264 -b:v 300k -y output.mp4
```

**Status:** This is already handled by the build process.

### Issue 3: LM Studio Vision Model Issues
**Problem:** Multiple issues with LM Studio vision models:
1. Model name mismatch: Used `qwen3-vl-4b` but actual ID was `qwen/qwen3-vl-4b`
2. Models need to be explicitly loaded in LM Studio
3. Some models report as available but return "Model does not support images"
4. Model loading can fail with "Operation canceled" if another model is using GPU memory

**Testing approach that worked:**
```python
# First test basic chat
response = requests.post(
    "http://localhost:1234/v1/chat/completions",
    json={"model": "MODEL_NAME", "messages": [{"role": "user", "content": "hello"}], "max_tokens": 10}
)

# Then test with image
response = requests.post(
    "http://localhost:1234/v1/chat/completions",
    json={
        "model": "MODEL_NAME",
        "messages": [{
            "role": "user",
            "content": [
                {"type": "text", "text": "Describe this image"},
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{base64_image}"}}
            ]
        }],
        "max_tokens": 100
    }
)
```

**Models tested:**
- `qwen/qwen3-vl-4b` - Failed to load (memory conflict)
- `qwen/qwen3-vl-30b` - Worked but slow
- `glm-4.6v-flash` - Returned "Model does not support images" error

**Skill Update Needed:** Add better model detection and fallback in image analysis scripts.

### Issue 4: Ollama Vision Model Timeouts
**Problem:** Ollama with `qwen3-vl:8b` had frequent read timeouts (120s) on larger/complex images.

**Solution:** The script continues processing after timeout errors. Consider:
- Increasing timeout for complex images
- Adding retry logic
- Skipping problematic images

**Final stats with Ollama:**
- 239 images analyzed
- 37 quotes extracted (34 new)
- Duration: ~21 hours (75512 seconds) due to timeouts and retries

### Issue 5: Activities Data Structure
**Problem:** Original activity format only supported single tool link:
```json
{
  "tool": "Google AI Studio",
  "toolUrl": "https://aistudio.google.com"
}
```

**Solution:** Added support for multiple tools:
```json
{
  "tools": [
    { "name": "Views from History", "url": "https://viewfromhistory.semanticmachines.fyi" },
    { "name": "MPI Explorer", "url": "https://mpiexplorer-example.researchity.net" }
  ]
}
```

**Updated ActivitiesPage.tsx to handle both formats:**
```tsx
{activity.tools && activity.tools.map((toolItem, toolIndex) => (
  <a href={toolItem.url}>{toolItem.name}</a>
))}
{!activity.tools && activity.toolUrl && (
  <a href={activity.toolUrl}>{activity.tool}</a>
)}
```

**Skill Update Needed:** Update entities format documentation and extraction logic to support multiple tools per activity.

### Issue 6: Unused Variable TypeScript Error
**Problem:** Build failed with `'hasTalkPage' is declared but its value is never read`

**Solution:** Removed unused variable from HomePage.tsx

**Skill Update Needed:** Consider adding linting step before build or using `_` prefix for intentionally unused variables.

### Issue 7: Quote Slide Index Mismatch
**Problem:** Quotes in `entities.json` had incorrect `slideIndex` values. For example, a quote claiming to be on slide 89 was actually on slide 108. This caused "Go to slide X" links to point to wrong slides.

**Root Cause:** The slideIndex values in entities.json were based on an older version of the presentation or were manually entered incorrectly. When the presentation was rebuilt with different slides, the indices became out of sync.

**Examples of mismatches found:**
| Quote Attribution | Claimed Slide | Actual Slide |
|------------------|---------------|--------------|
| Ethan Mollick | 16 | 23 |
| W. F. McMullen | 19 | 26 |
| Potter and Wetherell | 96 | 128 |
| Bender & Hanna | 89 | 108 |

**Solution:** Created a verification script to find mismatches by searching for quote text in slide content:
```python
import json

with open('src/data/presentation.json') as f:
    pres = json.load(f)

with open('src/data/entities.json') as f:
    entities = json.load(f)

# Build searchable index of slide text
slide_text = {}
for section in pres['sections']:
    for slide in section['slides']:
        order = slide.get('order', 0)
        text_parts = [slide.get('title', '')]
        for item in slide.get('content', []):
            if item.get('type') == 'list':
                for li in item.get('items', []):
                    text_parts.append(li.get('text', ''))
        slide_text[order] = ' '.join(text_parts).lower()

# Check each quote
for q in entities['quotes']:
    claimed = q.get('slideIndex', 0)
    snippet = q['text'][:30].lower()
    for order, content in slide_text.items():
        if snippet in content and order != claimed:
            print(f"MISMATCH: {claimed} -> {order}")
```

**Also fixed:** Quote with `"attribution": "Anonymous"` should have been `"Emily M. Bender & Alex Hanna"` (authors visible in slide title "Bender and Hanna, 2025, The AI Con").

**Skill Update Needed:**
1. Add slide index verification step after image analysis
2. Use slide titles to infer attributions when available
3. Mark AI-transcribed quotes with `extractedFromImage: true` flag

### Issue 9: slideIndex Off-by-One Error
**Problem:** Quote links showed wrong slide numbers (e.g., "View Slide 312" for a quote on slide 311).

**Root Cause:** The `slideIndex` in entities.json was stored as the slide's `order` value (1-indexed), but the UI code treats slideIndex as 0-indexed and adds 1 for display:
```tsx
<Link to={`/slides/${slideIndex + 1}`}>
  Slide {slideIndex + 1}
</Link>
```

**Solution:** Store slideIndex as 0-indexed in entities.json:
- Slide with order=311 → slideIndex=310
- UI displays: slideIndex+1 = 311 ✓

**Fix script:**
```python
for q in entities['quotes']:
    q['slideIndex'] = q['slideIndex'] - 1  # Convert to 0-indexed
```

**Prevention:** When adding quotes, always use 0-indexed slideIndex:
```python
new_quote = {
    "slideIndex": slide_order - 1,  # Convert order to 0-indexed
    ...
}
```

### Issue 8: AI-Transcribed Quote Indicator
**Problem:** Users can't tell which quotes were manually entered vs. AI-transcribed from images.

**Solution:** Added `extractedFromImage: boolean` field to quotes in entities.json and display an "AI transcribed" badge in the UI.

**Files updated:**
- `src/data/types.ts` - Added `extractedFromImage?: boolean` to QuoteResource
- `src/utils/extractResources.ts` - Pass through the field
- `src/components/resources/ResourceListItem.tsx` - Display amber "AI transcribed" badge

```tsx
{extractedFromImage && (
  <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
    AI transcribed
  </span>
)}
```

### Issue 10: Resources Page Sub-Filters
**Problem:** The Resources page had main category filters (People, Quotes, Links, etc.) but no way to further filter within categories.

**Solution:** Added sub-filter pills for quotes and links:

**Quote sub-filters:**
- **Topic**: AI & Technology, Research Methods, Linguistics, Philosophy, Education, Books & Literature, General
- **Author**: All unique quote attributions

**Link sub-filters:**
- **Type**: Tools, Demos, Articles, Documentation, Research, Personal, Websites

**Implementation:**

1. Updated `src/data/types.ts`:
```typescript
export interface QuoteResource {
  // ... existing fields
  topic?: string;  // NEW: ai_technology, research_methods, linguistics, etc.
}

export interface LinkResource {
  // ... existing fields
  linkType?: string;  // NEW: tool, demo, article, documentation, etc.
}
```

2. Updated `src/utils/extractResources.ts` to pass through classification fields:
```typescript
const quotes = entities.quotes.map(q => ({
  ...existingFields,
  topic: q.topic,
}));

const links = entities.links.map(l => ({
  ...existingFields,
  linkType: l.linkType,
}));
```

3. Updated `src/pages/ResourcesPage.tsx`:
- Added state for sub-filters: `selectedTopic`, `selectedAuthor`, `selectedLinkType`
- Added label maps for display: `TOPIC_LABELS`, `LINK_TYPE_LABELS`
- Added pill filters that appear when viewing Quotes or Links
- Sub-filters clear when main filter changes

4. Updated `src/data/entities.json`:
- Added `topic` classification to all quotes
- Added `linkType` classification to all links

**Classification guidelines:**
- **tool**: Interactive tools and apps (NotebookLM, Claude, Elicit)
- **demo**: Example/demo sites for learning
- **article**: Blog posts, news articles
- **documentation**: Official docs, guides
- **research**: Academic papers, research tools
- **personal**: Personal sites, bios
- **website**: General websites, portals

### Issue 11: Slide Screenshot View Toggle
**Problem:** Users wanted to see the original PowerPoint slide screenshots alongside or instead of the rendered HTML content.

**Solution:** Added a toggle to switch between "Content View" (rendered HTML) and "Screenshot View" (original slide PNG).

**Implementation:**

**Step 1: Copy screenshots to public folder**
```bash
# Screenshots are in source folder as slide_NNNN.png (4-digit padded)
mkdir -p public/assets/screenshots
cp /path/to/source/screenshots/*.png public/assets/screenshots/
```

**Step 2: Create `src/hooks/useSlideViewMode.tsx`**
```typescript
import { createContext, useContext, useState, ReactNode } from 'react';

type ViewMode = 'content' | 'screenshot';

interface SlideViewModeContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
}

const SlideViewModeContext = createContext<SlideViewModeContextType | null>(null);

export function SlideViewModeProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('content');

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'content' ? 'screenshot' : 'content');
  };

  return (
    <SlideViewModeContext.Provider value={{ viewMode, setViewMode, toggleViewMode }}>
      {children}
    </SlideViewModeContext.Provider>
  );
}

export function useSlideViewMode() {
  const context = useContext(SlideViewModeContext);
  if (!context) {
    throw new Error('useSlideViewMode must be used within a SlideViewModeProvider');
  }
  return context;
}
```

**Step 3: Wrap SlidesPage with provider** (`src/pages/SlidesPage.tsx`)
```typescript
import { SlideViewModeProvider } from '../hooks/useSlideViewMode';

export default function SlidesPage() {
  // ...
  return (
    <NavigationProvider>
      <SlideViewModeProvider>
        <SlidesPageContent />
      </SlideViewModeProvider>
    </NavigationProvider>
  );
}
```

**IMPORTANT:** The provider must wrap both `useKeyboard` (which calls `toggleViewMode`) AND `SlideContainer` (which uses `viewMode`). Placing it inside `SlideView.tsx` causes errors because `SlideViewContent.tsx` uses `useKeyboard` outside that component.

**Step 4: Update `src/components/layout/SlideContainer.tsx`**
```typescript
import type { FlatSlide } from '../../data/types';
import SlideRenderer from '../slides/SlideRenderer';
import { useSlideViewMode } from '../../hooks/useSlideViewMode';

interface SlideContainerProps {
  slide: FlatSlide;
}

export default function SlideContainer({ slide }: SlideContainerProps) {
  const { viewMode, setViewMode } = useSlideViewMode();

  // Generate screenshot path from slide order (1-indexed, 4-digit padded)
  const slideOrder = slide.order || (slide.globalIndex + 1);
  const screenshotPath = `/assets/screenshots/slide_${String(slideOrder).padStart(4, '0')}.png`;

  return (
    <div className="flex flex-col h-full w-full">
      {/* View Toggle */}
      <div className="flex justify-center gap-2 py-2 bg-gray-100 border-b">
        <button
          onClick={() => setViewMode('content')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
            viewMode === 'content'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50 border'
          }`}
        >
          Content View
        </button>
        <button
          onClick={() => setViewMode('screenshot')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
            viewMode === 'screenshot'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50 border'
          }`}
        >
          Screenshot View
        </button>
      </div>

      {/* Slide Content */}
      <div className="slide-container flex-1 w-full bg-white rounded-lg shadow-lg overflow-hidden">
        {viewMode === 'content' ? (
          <SlideRenderer slide={slide} />
        ) : (
          <div className="h-full flex items-center justify-center p-4 bg-gray-900">
            <img
              src={screenshotPath}
              alt={`Slide ${slideOrder}: ${slide.title}`}
              className="max-h-full max-w-full object-contain rounded shadow-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,...placeholder...';
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 5: Add keyboard shortcut** (`src/hooks/useKeyboard.ts`)
```typescript
import { useSlideViewMode } from './useSlideViewMode';

export function useKeyboard() {
  const { toggleViewMode } = useSlideViewMode();
  // ...
  switch (event.key) {
    // ... other cases
    case 'v':
      event.preventDefault();
      toggleViewMode();
      break;
  }
}
```

**Step 6: Update `scripts/processMedia.js`** to copy screenshots automatically
```javascript
const DEST_SCREENSHOTS = path.join(ROOT_DIR, 'public/assets/screenshots');
const SCREENSHOTS_DIR = path.join(ROOT_DIR, 'sourcematerials/screenshots');

// Create directory
fs.mkdirSync(DEST_SCREENSHOTS, { recursive: true });

// Copy screenshots if available
if (fs.existsSync(SCREENSHOTS_DIR)) {
  const screenshots = fs.readdirSync(SCREENSHOTS_DIR).filter(f =>
    ['.png', '.jpg', '.jpeg'].includes(path.extname(f).toLowerCase())
  );
  screenshots.forEach(file => {
    fs.copyFileSync(
      path.join(SCREENSHOTS_DIR, file),
      path.join(DEST_SCREENSHOTS, file)
    );
  });
  console.log(`  - Screenshots: ${screenshots.length}`);
}
```

**Step 7: Update keyboard shortcuts modal** (`src/components/KeyboardShortcutsModal.tsx`)
```typescript
{ category: 'Slide Navigation (on Slides page)', items: [
  // ... existing items
  { keys: ['v'], description: 'Toggle content / screenshot view' },
]},
```

**File naming convention:**
- Screenshots: `slide_0001.png`, `slide_0002.png`, ... (4-digit padded, 1-indexed)
- Order matches `slide.order` field in presentation.json

**Gotcha:** If you get "useSlideViewMode must be used within a SlideViewModeProvider" error, ensure the provider wraps the component tree at `SlidesPage.tsx` level, not inside individual components

### Issue 12: Keyboard Shortcuts UI Hints and Go-To-Slide
**Problem:** Users didn't know about available keyboard shortcuts without opening the help modal.

**Solution:** Added visible keyboard hints in the slide view and implemented 'G' for go-to-slide.

**Implementation:**

**Step 1: Add keyboard hints to SlideContainer** (`src/components/layout/SlideContainer.tsx`)
```tsx
<span className="hidden sm:inline-flex items-center gap-1 text-xs text-gray-400 ml-4">
  <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded">←</kbd>
  <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded">→</kbd>
  <span className="mx-1">slide</span>
  <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded">↑</kbd>
  <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded">↓</kbd>
  <span className="mx-1">section</span>
  <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded">V</kbd>
  <span className="mx-1">view</span>
  <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded">G</kbd>
  <span>go to</span>
</span>
```

**Step 2: Implement go-to-slide shortcut** (`src/hooks/useKeyboard.ts`)
```typescript
export function useKeyboard() {
  const { goToSlide, totalSlides, ...other } = useNavigation();
  // ...
  switch (event.key) {
    // ... other cases
    case 'g':
      event.preventDefault();
      const input = prompt(`Go to slide (1-${totalSlides}):`);
      if (input) {
        const num = parseInt(input, 10);
        if (!isNaN(num) && num >= 1 && num <= totalSlides) {
          goToSlide(num - 1); // Convert to 0-indexed
        }
      }
      break;
  }
}
```

**Step 3: Update keyboard shortcuts modal** (`src/components/KeyboardShortcutsModal.tsx`)
```typescript
{ keys: ['g'], description: 'Go to slide number' },
```

**Full keyboard shortcuts for slides:**
| Key | Action |
|-----|--------|
| ← → | Previous / Next slide |
| ↑ ↓ | Previous / Next section |
| Space | Next slide |
| Home / End | First / Last slide |
| G | Go to slide number (prompts) |
| V | Toggle content / screenshot view |

### Issue 13: SmartArt List Layout Not Matching Original
**Problem:** SmartArt with list layouts (e.g., "Icon Vertical Solid List") rendered each item as a separate box with children nested below, instead of grouped cards like the original PPT.

**Original PPT:** Grouped cards with icon + title on left, children list on right, gray background.
**Before fix:** Each node and child rendered as separate colored boxes with indentation.

**Solution:** Detect list-style layouts and render as grouped cards.

**Implementation** (`src/components/content/SmartArtDiagram.tsx`):

```typescript
// Check if layout is a list-style (should be rendered as grouped cards)
function isListLayout(layout: string): boolean {
  const listPatterns = ['list', 'vertical', 'stacked', 'solid'];
  const layoutLower = layout.toLowerCase();
  return listPatterns.some(p => layoutLower.includes(p));
}

// Grouped card component for list-style layouts
function GroupedCardNode({ node }: { node: SmartArtNode }) {
  return (
    <div className="bg-gray-200 rounded-lg p-4 flex items-start gap-4">
      {/* Icon with navy filter */}
      {node.icon && (
        <img
          src={node.icon}
          className="w-10 h-10 object-contain shrink-0 mt-1"
          style={{ filter: 'brightness(0) saturate(100%) invert(15%) sepia(30%) saturate(1000%) hue-rotate(180deg)' }}
        />
      )}
      {/* Content: title on left, children on right */}
      <div className="flex-1 flex flex-col sm:flex-row sm:items-start sm:gap-8">
        <div className="flex-1">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--color-primary)' }}>
            {node.text}
          </h3>
        </div>
        {node.children && node.children.length > 0 && (
          <div className="text-sm text-gray-600 sm:text-right">
            {node.children.map((child) => (
              <div key={child.id}>{child.text}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// In main component, check layout type
if (isListLayout(content.layout)) {
  return (
    <div className="space-y-3 p-2">
      {content.nodes.map((node) => (
        <GroupedCardNode key={node.id} node={node} />
      ))}
    </div>
  );
}
```

**SmartArt layout patterns detected:**
- "Icon Vertical Solid List"
- "Basic Block List"
- "Vertical Block List"
- Any layout containing: list, vertical, stacked, solid

---

## Scripts Created

### Two-Phase Image Analysis

Image analysis is split into two phases to ensure proper quote classification:

**Phase 1: Image Description & Text Extraction** (automated scripts)
- Describes what each image is (type/category)
- Extracts ALL visible text
- Stores in `presentation.json` under `extracted_text` field

**Phase 2: Quote Classification** (agent with context)
- Reviews extracted text WITH slide context
- Identifies real quotes (human statements worth citing)
- Filters out: AI output examples, demo text, UI labels
- Adds valid quotes to `entities.json`

### 1. `scripts/analyze-images-lmstudio.py`
Phase 1 script for LM Studio with OpenAI-compatible API:
```bash
LMSTUDIO_MODEL="qwen/qwen3-vl-4b" python scripts/analyze-images-lmstudio.py .
```

Environment variables:
- `LMSTUDIO_URL` (default: `http://localhost:1234/v1`)
- `LMSTUDIO_MODEL` (default: `qwen3-vl-4b`)

### 2. `scripts/analyze-images-ollama.py`
Phase 1 script for Ollama with native API:
```bash
OLLAMA_MODEL="qwen3-vl:8b" python scripts/analyze-images-ollama.py .
```

Environment variables:
- `OLLAMA_URL` (default: `http://localhost:11434`)
- `OLLAMA_MODEL` (default: `qwen3-vl:8b`)

Both scripts:
- Skip already-analyzed images (with both description AND category)
- Extract ALL visible text (stored in `extracted_text` field)
- Do NOT classify quotes (that's Phase 2)
- Save processing stats to processingStats.json

### Quote Classification Criteria (Phase 2)

A quote must meet ALL these criteria:
1. Statement by a **named human** (not AI, not "the story", not app names)
2. Expresses an **opinion, insight, or notable idea**
3. Would be **worth citing** in an academic or professional context

**DO NOT extract as quotes:**
- AI-generated text shown as examples (ChatGPT, Claude, Gemini outputs)
- Sample text used for demonstrations (stories, passages for analysis)
- UI text, labels, or data descriptions
- Text where attribution would be "Anonymous", "User", or an app name

**Invalid attributions to filter:**
```python
INVALID_ATTRIBUTIONS = {
    'chatgpt', 'claude', 'gemini', 'gpt-4', 'gpt-5', 'openai',
    'the story', 'user', 'anonymous', 'datavoyager',
    'elicit', 'sample text'
}
```

---

## Links Added

New links extracted/added to entities.json:
- `https://viewfromhistory.semanticmachines.fyi` - Views from History
- `https://mpiexplorer-example.researchity.net` - MPI Explorer
- `https://model-context-explorer-279180372926.us-west1.run.app/` - Model Context Explorer App
- `https://evals.semanticmachines.fyi` - Evals Semantic Machines
- `https://unweaver.researchity.net/` - Unweaver
- `https://windows-vibe-guide.pages.dev/` - Windows Vibe Coding Guide

---

## Files Modified

### Core Data
- `src/data/presentation.json` - New slides, image descriptions/categories
- `src/data/entities.json` - Activities with tools array, new quotes, new links
- `src/data/processingStats.json` - Image analysis stats
- `src/data/sessionInfo.ts` - Updated date

### Components
- `src/pages/ActivitiesPage.tsx` - New page with tools array support, sequential numbering
- `src/pages/HomePage.tsx` - Removed activities section, changed top link to Semantic Machines
- `src/pages/ResourcesPage.tsx` - Added sub-filters for quotes (topic/author) and links (type)
- `src/pages/MediaGalleryPage.tsx` - Keyboard navigation (Esc, arrows), category pills with colors
- `src/App.tsx` - Added /activities route
- `src/components/layout/SiteHeader.tsx` - Added Activities nav link
- `src/components/layout/SlideContainer.tsx` - Screenshot/content view toggle
- `src/pages/SlidesPage.tsx` - Wrapped with SlideViewModeProvider (provider must be here, not in SlideView)
- `src/components/resources/ResourceListItem.tsx` - AI transcribed badge for quotes
- `src/hooks/useGlobalKeyboard.ts` - Added 't' keyboard shortcut
- `src/hooks/useKeyboard.ts` - Added 'v' shortcut for view toggle
- `src/hooks/useSlideViewMode.tsx` - NEW: Context for view mode state
- `src/components/KeyboardShortcutsModal.tsx` - Added 't' and 'v' to shortcuts list

### Scripts
- `scripts/analyze-images-lmstudio.py` - NEW
- `scripts/analyze-images-ollama.py` - NEW

### Assets
- `public/assets/images/slides/slide_337_vibe_guide.png` - Screenshot for new slide

---

## Workflow That Worked

1. **Copy new presentation data to sourcematerials/**
2. **Run build** - `npm run build` (handles media processing, video compression)
3. **Preview locally** - `npm run dev`
4. **Run image analysis** (optional):
   - Check available models: `curl http://localhost:11434/api/tags` (Ollama)
   - Run analysis: `python scripts/analyze-images-ollama.py .`
5. **Rebuild after analysis** - `npm run build`
6. **Deploy** - `npx wrangler pages deploy dist --project-name=aiforresearch --commit-dirty=true`

---

## Recommendations for Skill Update

### 1. Source Verification
Add check to verify presentation ID in sourcematerials matches expected:
```python
# Check presentation ID before build
with open('sourcematerials/presentation.json') as f:
    data = json.load(f)
    actual_id = data.get('metadata', {}).get('presentationId', '')
    if expected_id and actual_id != expected_id:
        print(f"Warning: Expected {expected_id} but found {actual_id}")
```

### 2. Activities Format Documentation
Update the skill documentation to show the new tools array format:
```json
{
  "title": "Activity Name",
  "description": "Description",
  "tools": [
    { "name": "Tool 1", "url": "https://..." },
    { "name": "Tool 2", "url": "https://..." }
  ],
  "slideIndex": 58,
  "section": "Section Name"
}
```

### 3. Image Analysis Integration
Add image analysis as optional step in workflow:
- Detect available backends (LM Studio, Ollama, Gemini)
- Offer interactive review UI or batch processing
- Handle timeouts gracefully

### 4. Screenshot Fetching
For adding slides with external screenshots:
```bash
curl -L -o public/assets/images/slides/slide_XXX_name.png \
  "https://image.thum.io/get/width/1200/crop/800/https://TARGET_URL"
```

### 5. Adding New Slides Programmatically
Python snippet to insert a slide and renumber:
```python
new_slide = {
    "order": TARGET_ORDER,
    "title": "Slide Title",
    "layout": "content",
    "content": [...],
    "notes": "https://..."
}

# Renumber slides >= TARGET_ORDER
for section in data['sections']:
    for slide in section['slides']:
        if slide.get('order', 0) >= TARGET_ORDER:
            slide['order'] += 1

# Insert in appropriate section
for section in data['sections']:
    if section.get('title') == 'Target Section':
        section['slides'].insert(position, new_slide)
        break
```

### 6. Quote Slide Index Verification
After extracting quotes (manually or via AI), verify slideIndex values match actual content:
```python
import json

def verify_quote_indices(presentation_path, entities_path):
    """Check that quote slideIndex values match actual slide content."""
    with open(presentation_path) as f:
        pres = json.load(f)
    with open(entities_path) as f:
        entities = json.load(f)

    # Build slide text index
    slide_text = {}
    slide_titles = {}
    for section in pres['sections']:
        for slide in section['slides']:
            order = slide.get('order', 0)
            slide_titles[order] = slide.get('title', '')
            text_parts = [slide.get('title', '')]
            for item in slide.get('content', []):
                if item.get('type') == 'list':
                    for li in item.get('items', []):
                        text_parts.append(li.get('text', ''))
            slide_text[order] = ' '.join(text_parts).lower()

    # Check quotes
    corrections = {}
    for i, q in enumerate(entities['quotes']):
        claimed = q.get('slideIndex', 0)
        snippet = q['text'][:30].lower()
        for order, content in slide_text.items():
            if snippet in content and order != claimed:
                corrections[i] = {'old': claimed, 'new': order}
                print(f"Quote {i}: {claimed} -> {order} ({slide_titles[order][:40]})")

    return corrections

# Run verification
corrections = verify_quote_indices('src/data/presentation.json', 'src/data/entities.json')
```

### 7. Mark Image-Extracted Quotes
When adding quotes from AI image analysis, mark them with `extractedFromImage: true`:
```python
new_quote = {
    "text": "Quote text...",
    "attribution": "Author Name",
    "source": f"Slide {slide_number}: {slide_title}",
    "slideIndex": slide_number,
    "extractedFromImage": True  # Mark as AI-transcribed
}
```

---

## Commits Made

1. `49e8798` - Add dedicated Activities page with 18 hands-on exercises
2. `3bc7884` - Update activities with multiple tool links and sequential numbering
3. `1be6901` - Add slide 336, AI image analysis, and extracted quotes
4. `2964d57` - Add slide screenshot toggle, resource filters, and media gallery improvements
5. `30ffa33` - Add keyboard hints UI and go-to-slide shortcut
6. `3ef0be4` - Improve SmartArt list layout to match PPT grouped cards

**Deployed:** https://aiforresearch.pages.dev

---

## Session 2: Visual Fidelity Improvements (January 24, 2026 - continued)

This session focused on making slide rendering match the original PowerPoint more closely.

### Issue 14: SmartArt Cards Should Fill Space with Dark Blue Background

**Problem:** SmartArt grouped cards rendered small with gray backgrounds instead of filling available space with the presentation's dark blue (`var(--color-primary)`) color scheme.

**Solution:**
1. Added `fillSpace` prop to SmartArtDiagram
2. Updated GroupedCardNode to use primary color background with white text
3. Made cards expand with `flex-1`

**Implementation** (`src/components/content/SmartArtDiagram.tsx`):

```typescript
interface SmartArtDiagramProps {
  content: SmartArtContent;
  fillSpace?: boolean;  // NEW: Allow cards to expand
}

function GroupedCardNode({ node, fillSpace }: { node: SmartArtNode; fillSpace?: boolean }) {
  return (
    <div
      className={`rounded-xl p-6 md:p-8 flex items-center gap-6 md:gap-8 ${fillSpace ? 'flex-1' : ''}`}
      style={{ background: 'var(--color-primary)' }}  // Dark blue instead of gray
    >
      {/* Icon - light colored for contrast */}
      {node.icon && (
        <img
          src={node.icon}
          className="w-16 h-16 md:w-20 md:h-20 object-contain shrink-0"
          style={{ filter: 'brightness(0) saturate(100%) invert(90%) sepia(10%) saturate(200%) hue-rotate(180deg)' }}
        />
      )}
      {/* Content with white text */}
      <div className="flex-1 text-white">
        <h3 className="text-xl md:text-2xl font-bold mb-2">{node.text}</h3>
        {node.children && node.children.length > 0 && (
          <ul className="space-y-1 text-sm md:text-base opacity-90">
            {node.children.map((child) => (
              <li key={child.id}>• {child.text}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
```

**Updated ContentRenderer** (`src/components/content/ContentRenderer.tsx`):
```typescript
case 'smart_art':
  return <SmartArtDiagram content={content as SmartArtContent} fillSpace />;
```

### Issue 15: SmartArt Empty Layout Detection

**Problem:** Slide 17 had an empty string `""` for layout, causing `isListLayout()` to return false and render incorrectly.

**Solution:** Updated detection to check node structure when layout is empty:

```typescript
function isListLayout(layout: string, nodes: SmartArtNode[]): boolean {
  const layoutLower = layout.toLowerCase();

  // Check layout name patterns
  const listPatterns = ['list', 'vertical', 'stacked', 'solid'];
  if (listPatterns.some(p => layoutLower.includes(p))) {
    return true;
  }

  // If layout is empty/unknown, check node structure
  // List layouts typically have level-0 nodes with icons and children
  if (!layout || layout.trim() === '') {
    const hasIconNodes = nodes.some(n => n.level === 0 && n.icon);
    const hasChildNodes = nodes.some(n => n.level === 0 && n.children && n.children.length > 0);
    return hasIconNodes && hasChildNodes;
  }

  return false;
}
```

### Issue 16: Horizontal Numbered SmartArt Layout

**Problem:** Slide 3 "Plan for the day" had numbered SmartArt that should display as horizontal cards with numbers, not vertical list.

**Solution:** Added detection and dedicated component for horizontal numbered layouts.

**Detection function:**
```typescript
function isHorizontalNumberedLayout(layout: string, nodes: SmartArtNode[]): boolean {
  const layoutLower = layout.toLowerCase();

  // Check layout name patterns
  if (layoutLower.includes('process') ||
      layoutLower.includes('numbered') ||
      layoutLower.includes('horizontal')) {
    return true;
  }

  // Check node structure: number nodes at level 0, content at level 1
  const hasNumberNodes = nodes.some(n =>
    n.level === 0 && /^\d+$/.test(n.text.trim())
  );
  const hasContentNodes = nodes.some(n =>
    n.level === 1 && n.children && n.children.length > 0
  );

  return hasNumberNodes && hasContentNodes;
}
```

**Horizontal numbered component:**
```typescript
function HorizontalNumberedDiagram({ nodes }: { nodes: SmartArtNode[] }) {
  // Parse nodes into number + content pairs
  const items: { number: string; title: string; children: SmartArtNode[] }[] = [];
  let currentNumber = '';

  for (const node of nodes) {
    if (node.level === 0 && /^\d+$/.test(node.text.trim())) {
      currentNumber = node.text.trim();
    } else if (node.level === 0 || node.level === 1) {
      items.push({
        number: currentNumber || String(items.length + 1),
        title: node.text,
        children: node.children || [],
      });
      currentNumber = '';
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="rounded-xl p-6 flex flex-col"
          style={{ background: 'var(--color-primary)' }}
        >
          {/* Large number */}
          <div className="text-5xl font-bold text-white/30 mb-2">
            {item.number}
          </div>
          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-3">
            {item.title}
          </h3>
          {/* Children as bullet list */}
          {item.children.length > 0 && (
            <ul className="space-y-1 text-white/80 text-sm">
              {item.children.map((child, i) => (
                <li key={i}>• {child.text}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Issue 17: Quote Slide Redesign

**Problem:** Quote slides needed to match original PPT with large quote mark on left (20%), text on right, attribution bar at bottom.

**Solution:** Completely rewrote QuoteSlide.tsx:

```typescript
import type { FlatSlide, ListContent, ListItem, TextRun } from '../../data/types';

interface QuoteSlideProps {
  slide: FlatSlide;
}

// Render quote text preserving bold formatting
function renderQuoteText(item: ListItem): React.ReactNode {
  if (item.runs && item.runs.length > 0) {
    return item.runs.map((run: TextRun, index: number) => {
      if (run.bold) {
        return <strong key={index}>{run.text}</strong>;
      }
      return <span key={index}>{run.text}</span>;
    });
  }
  return item.text;
}

export default function QuoteSlide({ slide }: QuoteSlideProps) {
  const listContent = slide.content.find(c => c.type === 'list') as ListContent | undefined;
  const quoteItem = listContent?.items?.[0];
  const attribution = slide.title;

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-card)' }}>
      {/* Main quote area */}
      <div className="flex-1 flex items-center p-6 md:p-10 lg:p-12">
        {/* Large quote mark - takes ~20% width */}
        <div className="hidden md:flex items-start justify-center w-[20%] shrink-0 pt-2">
          <svg
            viewBox="0 0 100 100"
            className="w-20 h-20 lg:w-28 lg:h-28"
            style={{ fill: 'var(--color-primary)' }}
          >
            <path d="M20 65c0-11 9-20 20-20 0-15-15-25-30-25v10c10 0 15 5 15 15-11 0-20 9-20 20s9 20 20 20 15-9 15-20zm45 0c0-11 9-20 20-20 0-15-15-25-30-25v10c10 0 15 5 15 15-11 0-20 9-20 20s9 20 20 20 15-9 15-20z" />
          </svg>
        </div>

        {/* Quote text - takes remaining ~80% */}
        <div className="flex-1 flex items-center">
          <blockquote
            className="text-xl md:text-2xl lg:text-3xl xl:text-4xl leading-relaxed font-normal"
            style={{ color: 'var(--color-primary)' }}
          >
            {quoteItem ? renderQuoteText(quoteItem) : slide.title}
          </blockquote>
        </div>
      </div>

      {/* Attribution bar at bottom */}
      {attribution && (
        <div
          className="shrink-0 py-4 px-6 md:px-10"
          style={{ background: 'var(--color-primary)' }}
        >
          <p className="text-white text-center text-lg md:text-xl font-medium">
            {attribution}
          </p>
        </div>
      )}
    </div>
  );
}
```

**Key design decisions:**
- Quote mark takes 20% width (hidden on mobile)
- Quote text uses `font-normal` so bolded parts stand out
- Attribution in full-width bar at bottom with primary color background
- Sans-serif fonts throughout (removed all serif references)

### Issue 18: TypeScript TextRun Interface

**Problem:** Build failed with `Property 'runs' does not exist on type 'ListItem'`.

**Solution:** Added TextRun interface and runs field to types.ts:

```typescript
// src/data/types.ts

export interface TextRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
}

export interface ListItem {
  text: string;
  level: number;
  children: ListItem[];
  runs?: TextRun[];  // NEW: For preserving text formatting
}
```

### Issue 19: Sidebar Slide Alignment

**Problem:** Sidebar slides needed left-aligned titles and vertically centered media content.

**Solution:** Updated SidebarSlide.tsx:

```typescript
export default function SidebarSlide({ slide }: SidebarSlideProps) {
  // Detect if content is primarily media (images/videos)
  const hasMedia = slide.content.some(c =>
    c.type === 'image' || c.type === 'video'
  );

  return (
    <div className="h-full flex flex-col lg:flex-row" style={{ background: 'var(--color-card)' }}>
      {/* Sidebar with title */}
      <div className="lg:w-1/3 p-6 md:p-8 flex flex-col" style={{ background: 'var(--color-primary)' }}>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white text-left">
          {slide.title}
        </h2>
      </div>

      {/* Main content - center if media */}
      <div className={`lg:w-2/3 p-6 md:p-8 overflow-y-auto ${
        hasMedia ? 'flex items-center justify-center' : ''
      }`}>
        {/* Content rendering... */}
      </div>
    </div>
  );
}
```

### Issue 20: Outline View Page

**Problem:** Needed hierarchical semantic structure view of presentation.

**Solution:** Created OutlinePage.tsx with expandable tree:

```typescript
// src/pages/OutlinePage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import presentationData from '../data/presentation.json';

interface OutlineNode {
  type: 'section' | 'subsection' | 'slide' | 'content';
  title: string;
  slideIndex?: number;
  children?: OutlineNode[];
}

function buildOutlineTree(sections: Section[]): OutlineNode[] {
  // Build hierarchical tree from sections, slides, content
  return sections.map((section, sectionIndex) => ({
    type: 'section',
    title: section.title,
    children: section.slides.map((slide, slideIndex) => ({
      type: 'slide',
      title: slide.title,
      slideIndex: calculateGlobalIndex(sectionIndex, slideIndex),
      children: extractContentNodes(slide.content),
    })),
  }));
}

function OutlineNode({ node, depth = 0 }: { node: OutlineNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);

  return (
    <div className="ml-4">
      <div
        className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-100"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Expand/collapse icon */}
        {node.children && node.children.length > 0 && (
          <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`}>
            <path d="M9 5l7 7-7 7" />
          </svg>
        )}

        {/* Node type icon */}
        <span className="text-sm">{getNodeIcon(node.type)}</span>

        {/* Title (link if slide) */}
        {node.type === 'slide' && node.slideIndex !== undefined ? (
          <Link
            to={`/slides?slide=${node.slideIndex}`}
            className="hover:text-blue-600"
          >
            {node.title}
          </Link>
        ) : (
          <span>{node.title}</span>
        )}
      </div>

      {/* Children */}
      {expanded && node.children && (
        <div className="ml-2">
          {node.children.map((child, i) => (
            <OutlineNode key={i} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
```

**Added keyboard shortcut 'O'** in useGlobalKeyboard.ts:
```typescript
case 'o':
  event.preventDefault();
  navigate('/outline');
  break;
```

**Added to navigation** in SiteHeader.tsx:
```typescript
<NavLink to="/outline">
  <span className="underline">O</span>utline
</NavLink>
```

### Issue 21: Grid View for Slides

**Problem:** Needed screenshot grid view with lazy loading for 337 slides.

**Solution:** Created GridPage.tsx with progressive loading:

```typescript
// src/pages/GridPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type GridSize = 'small' | 'medium' | 'large';

export default function GridPage() {
  const [gridSize, setGridSize] = useState<GridSize>('medium');
  const [showSectionLabels, setShowSectionLabels] = useState(true);
  const navigate = useNavigate();

  const gridCols: Record<GridSize, string> = {
    small: 'grid-cols-6 md:grid-cols-8 lg:grid-cols-10',
    medium: 'grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
    large: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with size toggle, section toggle */}
      <header className="sticky top-0 z-10">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {(['small', 'medium', 'large'] as GridSize[]).map((size) => (
            <button
              key={size}
              onClick={() => setGridSize(size)}
              className={gridSize === size ? 'bg-white shadow' : 'text-gray-500'}
            >
              {size === 'small' ? 'S' : size === 'medium' ? 'M' : 'L'}
            </button>
          ))}
        </div>
      </header>

      {/* Grid */}
      <div className={`grid ${gridCols[gridSize]} gap-2`}>
        {slides.map((slide) => (
          <SlideThumb
            key={slide.globalIndex}
            slide={slide}
            onClick={() => navigate(`/slides?slide=${slide.globalIndex}`)}
          />
        ))}
      </div>
    </div>
  );
}

function SlideThumb({ slide, onClick }: { slide: SlideWithMeta; onClick: () => void }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const screenshotPath = `/assets/screenshots/slide_${String(slide.order).padStart(4, '0')}.png`;

  return (
    <div className="relative cursor-pointer group" onClick={onClick}>
      {/* Loading placeholder */}
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center animate-pulse">
          {slide.order}
        </div>
      )}

      {/* Lazy-loaded image */}
      <img
        src={screenshotPath}
        loading="lazy"  // KEY: Browser-native lazy loading
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={loaded ? 'opacity-100' : 'opacity-0'}
      />

      {/* Hover overlay with title */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors">
        <div className="opacity-0 group-hover:opacity-100 text-white text-center">
          #{slide.order} {slide.title}
        </div>
      </div>
    </div>
  );
}
```

**Grid is accessible only from slides page:**
- Added 'R' shortcut in useKeyboard.ts (slides-specific)
- NOT in SiteHeader navigation (removed)
- Hint shown in SlideContainer.tsx

### Issue 22: Multi-Image Gallery with Lightbox

**Problem:** Slides with multiple images needed better display - adjustable grid and lightbox navigation.

**Solution:** Created ImageGallery.tsx component:

```typescript
// src/components/content/ImageGallery.tsx
import { useState, useEffect, useCallback } from 'react';
import type { ImageContent } from '../../data/types';

export default function ImageGallery({ images }: { images: ImageContent[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  // Adaptive grid columns based on image count
  const getGridCols = (count: number): string => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count === 3) return 'grid-cols-3';
    if (count === 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  // Adaptive max height based on count
  const getImageHeight = (count: number): string => {
    if (count === 1) return 'max-h-[60vh]';
    if (count === 2) return 'max-h-[50vh]';
    if (count <= 4) return 'max-h-[35vh]';
    return 'max-h-[25vh]';
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedIndex(null);
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex]);

  // Single image - simple render
  if (images.length === 1) {
    return (
      <figure className="flex flex-col items-center">
        <img
          src={images[0].src}
          className="max-w-full max-h-[60vh] object-contain cursor-pointer"
          onClick={() => setSelectedIndex(0)}
        />
        {selectedIndex !== null && <Lightbox ... />}
      </figure>
    );
  }

  // Multiple images - grid with lightbox
  return (
    <div className="w-full">
      <div className={`grid ${getGridCols(images.length)} gap-2`}>
        {images.map((image, index) => (
          <div
            key={index}
            className={`relative cursor-pointer group ${getImageHeight(images.length)}`}
            onClick={() => setSelectedIndex(index)}
          >
            {/* Loading spinner */}
            {!loadedImages.has(index) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            <img
              src={image.src}
              loading="lazy"
              onLoad={() => setLoadedImages(prev => new Set(prev).add(index))}
              className={`w-full h-full object-contain ${
                loadedImages.has(index) ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Image counter badge */}
            <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1.5 rounded">
              {index + 1}/{images.length}
            </div>
          </div>
        ))}
      </div>

      {selectedIndex !== null && <Lightbox ... />}
    </div>
  );
}

function Lightbox({ images, currentIndex, onClose, onPrev, onNext }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={onClose}>
      {/* Close button */}
      <button className="absolute top-4 right-4 text-white/70 hover:text-white">×</button>

      {/* Navigation buttons */}
      {images.length > 1 && (
        <>
          <button className="absolute left-4" onClick={(e) => { e.stopPropagation(); onPrev(); }}>←</button>
          <button className="absolute right-4" onClick={(e) => { e.stopPropagation(); onNext(); }}>→</button>
        </>
      )}

      {/* Image */}
      <img src={images[currentIndex].src} className="max-w-[90vw] max-h-[85vh] object-contain" />

      {/* Counter and hints */}
      <div className="absolute bottom-4 text-white/50 text-xs">
        {currentIndex + 1} of {images.length} • ← → navigate • Esc close
      </div>
    </div>
  );
}
```

**Updated MediaSlide.tsx to use ImageGallery:**
```typescript
import ImageGallery from '../content/ImageGallery';

const imageContent = slide.content.filter(c => c.type === 'image') as ImageContent[];

{imageContent.length > 0 && (
  <ImageGallery images={imageContent} />
)}
```

---

## Slide Types Classification Document

Created `/Users/dominiklukes/gitrepos/ppt-tools/slidetypes.md` documenting all slide and SmartArt layout types found in the presentation.

**Slide Types:**
| Type | Description | Component |
|------|-------------|-----------|
| `title` | Title slide with centered text | TitleSlide |
| `section_header` | Section divider | SectionHeader |
| `quote` | Quote with attribution | QuoteSlide |
| `sidebar` | Title bar on left, content on right | SidebarSlide |
| `media` | Image/video focused | MediaSlide |
| `content` | Default with bullets/text | ContentSlide |

**SmartArt Layouts:**
| Layout Pattern | Detection | Rendering |
|----------------|-----------|-----------|
| List/Vertical/Solid | `isListLayout()` | GroupedCardNode |
| Process/Numbered/Horizontal | `isHorizontalNumberedLayout()` | HorizontalNumberedDiagram |
| Empty string | Check node structure | Infer from icons/children |
| Unknown | Default | SmartArtNode tree |

---

## Files Created/Modified (Session 2)

### New Files
- `src/pages/OutlinePage.tsx` - Hierarchical outline view
- `src/pages/GridPage.tsx` - Screenshot grid with lazy loading
- `src/components/content/ImageGallery.tsx` - Multi-image gallery with lightbox
- `/Users/dominiklukes/gitrepos/ppt-tools/slidetypes.md` - Slide types documentation

### Modified Files
- `src/components/content/SmartArtDiagram.tsx` - Dark blue cards, fillSpace, horizontal numbered
- `src/components/slides/QuoteSlide.tsx` - Complete rewrite with 20% quote mark area
- `src/components/slides/SidebarSlide.tsx` - Left-aligned title, media centering
- `src/components/slides/MediaSlide.tsx` - Use ImageGallery for images
- `src/components/slides/ContentSlide.tsx` - Sans-serif fonts
- `src/components/slides/TitleSlide.tsx` - Sans-serif fonts
- `src/components/content/ContentRenderer.tsx` - Pass fillSpace to SmartArt
- `src/data/types.ts` - Added TextRun interface, runs field on ListItem
- `src/hooks/useKeyboard.ts` - Added 'r' for grid
- `src/hooks/useGlobalKeyboard.ts` - Added 'o' for outline
- `src/components/layout/SiteHeader.tsx` - Added Outline nav, underline 'A' in About
- `src/components/layout/SlideContainer.tsx` - Added 'R' hint
- `src/App.tsx` - Added /outline and /grid routes

---

## Commits Made (Session 2)

7. `df243cf` - Add keyboard shortcut 'A' to navigate to About page
8. `be358bd` - Underline 'A' in About navigation link to show keyboard shortcut
9. Plus multiple commits for SmartArt, quote slides, gallery, outline, grid

**Latest Deployment:** https://006a95e0.aiforresearch.pages.dev

---

## Session 3 Updates (January 24, 2026 - continued)

### Media Slide Types Refinement

Updated MediaSlide component to handle two distinct sub-types:

#### 5a. Media Only (No Description)
- Blue strip at top with **centered** white title text
- Media (images/videos) centered in remaining space
- Similar visual pattern to quote slide bottom bar

#### 5b. Media with Description
- Blue strip at top with **centered** white title text
- Left side: Media (images/videos) centered
- Right side: Gray box (~40% width) with description text, left-aligned, vertically centered

**Key changes to `MediaSlide.tsx`:**
```tsx
// Type 1: Media only - blue strip at top
if (!hasDescription) {
  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-card)' }}>
      <div className="px-6 md:px-10 py-4 md:py-6" style={{ background: 'var(--color-primary)' }}>
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white text-center">
          {slide.title}
        </h2>
      </div>
      <div className="flex-1 flex items-center justify-center p-4 md:p-6">
        <MediaGallery images={imageContent} videos={videoContent} />
      </div>
    </div>
  );
}

// Type 2: Media with description - blue strip top, media left, gray description right
return (
  <div className="h-full flex flex-col" style={{ background: 'var(--color-card)' }}>
    <div className="px-6 md:px-10 py-4 md:py-6" style={{ background: 'var(--color-primary)' }}>
      <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white text-center">
        {slide.title}
      </h2>
    </div>
    <div className="flex-1 flex flex-col lg:flex-row">
      <div className="flex-1 flex items-center justify-center p-4 md:p-6">
        <MediaGallery ... />
      </div>
      <div className="lg:w-2/5 flex items-center p-4 md:p-6"
           style={{ background: 'var(--color-muted, #f3f4f6)' }}>
        {textContent.map(...)}
      </div>
    </div>
  </div>
);
```

### Content Slide Statement Rendering

Updated content slides with title-only to render as "statement slides":
- Left-aligned text on light background
- Bold formatting for text before first colon (e.g., "**AI Hype:** There is always hype...")
- Question splitting (e.g., "Why? What for?" renders as two separate lines)
- Used by TitleSlide and ContentSlide when no content items present

### Files Modified (Session 3)
- `src/components/slides/MediaSlide.tsx` - Two-type rendering with blue title strip
- `src/components/slides/TitleSlide.tsx` - FormattedTitle for statement slides
- `src/components/slides/ContentSlide.tsx` - FormattedTitle for statement slides
- `slidetypes.md` - Documented 5a/5b media types, 6a/6b/6c content types

---

### SmartArt Layout Improvements

#### Issue: All SmartArt rendered as dark blue cards
SmartArt was rendering with dark blue background and white text regardless of layout type. This didn't match the original slide designs.

#### Solution: Split horizontal vs vertical layouts

**1. Horizontal Icon Layouts** (2-4 items with icons)
Detection: `isHorizontalIconLayout()` checks for:
- Layout contains "icon label description", "icon label list", "centered icon"
- OR 2-4 nodes all with icons and children

Rendering (`HorizontalIconDiagram`):
```tsx
<div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start justify-center">
  {nodes.map((node) => (
    <div className="flex-1 flex flex-col items-start max-w-sm">
      <img src={node.icon} className="w-20 h-20 md:w-24 md:h-24"
           style={{ filter: 'dark-blue-filter' }} />
      <h3 className="text-xl md:text-2xl font-bold"
          style={{ color: 'var(--color-primary)' }}>{node.text}</h3>
      {node.children.map(child => <p>{child.text}</p>)}
    </div>
  ))}
</div>
```

**2. Vertical List Layouts** (5+ items or explicit vertical)
Detection: `isVerticalListLayout()` checks for:
- Layout contains "vertical", "stacked", "solid"
- OR 5+ nodes
- OR empty layout with simple structure

Rendering (`GroupedCardNode`):
- Light grey background (`#e5e7eb`) instead of dark blue
- Dark blue text (`var(--color-primary)`) instead of white
- Icons filtered to dark blue
- Title on left, description on right

**3. TitleSlide SmartArt handling**
Added new rendering path for slides with SmartArt but no media:
```tsx
if (hasSmartArt && !hasMedia) {
  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-card)' }}>
      {/* Blue title strip */}
      <div style={{ background: 'var(--color-primary)' }}>
        <h1 className="text-white text-center">{slide.title}</h1>
      </div>
      {/* SmartArt centered below */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        {smartArtContent.map(c => <ContentRenderer content={c} />)}
      </div>
    </div>
  );
}
```

#### Examples
- Slide 63 "AI capability is MO" - 2 horizontal items (Model, Orchestration)
- Slide 65 "The current frontier of AI capabilities" - 5 vertical items (Multimodality, Long Context, etc.)
- Slide 67 "Accessing the Frontier" - 3 horizontal items (Models, Apps, Chatbots)

### Files Modified (SmartArt)
- `src/components/content/SmartArtDiagram.tsx` - Added horizontal icon layout, updated vertical list styling
- `src/components/slides/TitleSlide.tsx` - Added SmartArt-only slide handling with blue title strip
- `slidetypes.md` - Documented SmartArt layout types
