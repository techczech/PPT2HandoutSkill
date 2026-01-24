# PowerPoint Slide Types Classification

This document classifies slide types from PowerPoint presentations and describes how they should be rendered in the web handout format.

## Overview

Slides are classified based on two main factors:
1. **Slide Layout** - The PowerPoint layout name (from `slide.layout`)
2. **Content Type** - What content blocks are present (text, images, SmartArt, video)

## Slide Layout Categories

### 1. Title Slides
**Detection**: Layout contains "title slide" or is the first slide
**Examples**: `Title Slide - Image Background`
**Rendering**: Full-bleed gradient background, centered large title, subtitle below

### 2. Section Headers
**Detection**: Layout contains "section heading"
**Examples**:
- `Section heading with image (white)`
- `Section heading with image (blue)`
- `1_Section heading with image (white)`
**Rendering**: Centered title with "Section" label above, gradient background (blue or white variant)

### 3. Sidebar Slides
**Detection**: Layout contains "sidebar", "side bar", or "half page"
**Examples**:
- `Sidebar title without text` (74 slides)
- `Side bar title with text` (47 slides)
- `Half page title` (3 slides)
- `Half page title with text` (3 slides)
**Rendering**: 40% left column (primary color) with title, 60% right column with content
**Content handling**:
- If content is SmartArt → render SmartArt diagram filling the space
- If content is image/video → center the media
- If content is text → render as bullets

### 4. Quote Slides
**Detection**: Layout equals "Quote"
**Examples**: `Quote` (21 slides)
**Rendering**:
- Large quote mark icon (20% left)
- Quote text (80% right) with bold formatting preserved
- Attribution bar at bottom (primary color background, white text)
**Data structure**:
- `slide.title` = attribution
- `slide.content[].items[0].runs[]` = text with bold markers

### 5. Media Slides
**Detection**: Layout contains "image", "screenshot", or "video"
**Examples**:
- `Title only for image or SmartArt` (29 slides)
- `Video with description` (22 slides)
- `Screenshot description` (5 slides)
- `Hidden title for image or SmartArt` (1 slide)

Media slides are classified into two sub-types based on whether they have description text:

#### 5a. Media Only (No Description)
**Detection**: No list/text content, just images/videos
**Rendering**:
- Blue strip at top with white title text (similar to quote slide bottom bar)
- Media (images/videos) centered in remaining space
- Uses MediaGallery component for multi-image layouts

```
┌────────────────────────────────────────────────────┐
│            Title Text (white on blue)              │
├────────────────────────────────────────────────────┤
│                                                    │
│              ┌────────────────┐                    │
│              │     Image      │                    │
│              │    or Video    │                    │
│              └────────────────┘                    │
│                                                    │
└────────────────────────────────────────────────────┘
```

#### 5b. Media with Description
**Detection**: Has list/text content alongside images/videos
**Layout examples**: `Video with description`, `Screenshot description`
**Rendering**:
- Blue strip at top with white title text
- Left side: Media (images/videos) centered
- Right side: Gray box (~40% width) with description text, left-aligned, vertically centered
- Description box adapts height to content

```
┌────────────────────────────────────────────────────┐
│            Title Text (white on blue)              │
├────────────────────────────────────────────────────┤
│                           │                        │
│    ┌────────────────┐     │  Description text      │
│    │     Image      │     │  in gray box           │
│    │    or Video    │     │                        │
│    └────────────────┘     │  • Bullet points       │
│                           │  • URL                 │
│                           │                        │
└────────────────────────────────────────────────────┘
```

**Note**: The gray description box uses `var(--color-muted, #f3f4f6)` for background, providing visual separation from the media area while maintaining readability.

### 6. Content Slides (Default)
**Detection**: Layout contains "title only", "text only", or doesn't match other categories
**Examples**:
- `Title only (for single text lines)` (81 slides)
- `Title Only` (25 slides)
- `Text only with title` (1 slide)

Content slides are further classified into three sub-types based on their content:

#### 6a. Title + Bullet Points
**Detection**: Has list content with bullet items
**Rendering**: Title at top, bullet list below (max-width constrained to ~55ch for readability)

#### 6b. Title + Text
**Detection**: Has text content but not bullet list
**Rendering**: Title at top, text content below (max-width constrained)

#### 6c. Statement Slides (Title Only)
**Detection**: No content blocks (images, lists, SmartArt) - just the title
**Purpose**: Short statements, provocative questions, or transitional phrases that serve as signposts
**Rendering**:
- Light background (`var(--color-card)`)
- Left-aligned text (not centered)
- Large text size (responsive: 2xl to 5xl)
- Primary color text
- Special formatting for titles with colons or question marks:
  - **Colon pattern** (e.g., "AI Hype: What's real and what's not"): Bold the prefix before colon
  - **Question pattern** (e.g., "Why? What for?"): Split into separate paragraphs
- Max-width 4xl to prevent overly wide lines

```
┌────────────────────────────────────────────────────┐
│                                                    │
│  Statement Slide:                                  │
│  What does it mean to                              │
│  understand?                                       │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Note**: Statement slides are used for accessibility - the title text serves as the slide's accessible name while also being the visual content. Previously these were rendered with centered white text on a gradient background, but left-aligned dark text on light background is more readable and matches common presentation design patterns.

---

## SmartArt Layout Types

SmartArt diagrams require special rendering based on their layout type.

### 1. Horizontal Icon Layouts (2-4 items side by side)
**Detection**: Layout contains "icon label description", "icon label list", or "centered icon"; OR 2-4 nodes all with icons and children
**Examples**:
- `Icon Label Description List` (11 instances) - e.g., slide 63 "AI capability is MO"
- `Icon Label List` (3 instances)
- `Centered Icon Label Description List` (2 instances)

**Rendering**: Items displayed horizontally with icon on top, title below, description at bottom
```
┌─────────────────────────────────────────────────────────────┐
│                    Title (blue strip)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│    [icon]                        [icon]                     │
│                                                             │
│    Title                         Title                      │
│    Description line 1            Description line 1         │
│    Description line 2            Description line 2         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
- Icons: Large (w-20/h-20 to w-24/h-24), dark blue filter
- Titles: Bold, dark blue (`var(--color-primary)`)
- Descriptions: Regular weight, dark blue

### 2. Vertical List Layouts (5+ items stacked)
**Detection**: Layout contains "vertical", "stacked", or "solid"; OR 5+ nodes; OR empty layout with simple structure
**Examples**:
- `Icon Vertical Solid List` (22 instances) - e.g., slide 65 "The current frontier of AI capabilities"
- Empty layout `""` with simple node structure (8 instances)

**Rendering**: Stacked cards with light grey background, dark blue text
```
┌───────────────────────────────────────────────────┐
│ [icon]  Main Text                    Description  │
├───────────────────────────────────────────────────┤
│ [icon]  Main Text                    Description  │
├───────────────────────────────────────────────────┤
│ [icon]  Main Text                    Description  │
└───────────────────────────────────────────────────┘
```
- Background: Light grey (`#e5e7eb`)
- Icons: Dark blue filter
- Text: Dark blue (`var(--color-primary)`)
- Layout: Title on left, description on right (flex justify-between)

### 3. Horizontal Process/Numbered Layouts
**Detection**: Layout contains "horizontal", "process", or "numbered"
**Examples**:
- `Basic Linear Process Numbered` (1 instance) - "Plan for the day"
- `Horizontal Action List` (1 instance)

**Rendering**: Horizontal row of numbered cards
```
┌──────────────────────────────────────────────────────────────────────┐
│ ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                    │
│ │  1   │  │  2   │  │  3   │  │  4   │  │  5   │                    │
│ │      │  │      │  │      │  │      │  │      │                    │
│ │ Text │  │ Text │  │ Text │  │ Text │  │ Text │                    │
│ │• sub │  │• sub │  │• sub │  │• sub │  │• sub │                    │
│ └──────┘  └──────┘  └──────┘  └──────┘  └──────┘                    │
└──────────────────────────────────────────────────────────────────────┘
```

**Data structure for numbered layouts**:
- Nodes with `level: 0` and numeric text ("1", "2", etc.) = circle numbers
- Nodes with `level: 1` and children = card content
- Children contain sub-items (times, descriptions)

### 3. Circle/Icon Layouts
**Detection**: Layout contains "circle"
**Examples**: `Icon Circle Label List` (2 instances)

**Rendering**: Items with prominent circular icons

---

## Content Block Types

### Heading
```json
{ "type": "heading", "text": "...", "level": 1 }
```
Usually filtered out (redundant with slide.title)

### List
```json
{
  "type": "list",
  "style": "bullet" | "numbered",
  "items": [
    {
      "text": "plain text",
      "level": 0,
      "children": [],
      "runs": [
        { "text": "normal " },
        { "text": "bold", "bold": true },
        { "text": " normal" }
      ]
    }
  ]
}
```
- `runs` array preserves bold/italic formatting
- `level` indicates nesting depth
- `children` for nested bullets

### Image
```json
{
  "type": "image",
  "src": "/assets/images/slides/...",
  "alt": "...",
  "caption": "...",
  "description": "AI-generated description",
  "category": "screenshot|diagram|photo|tweet|...",
  "quote_text": "extracted quote if any",
  "quote_attribution": "who said it"
}
```

### Video
```json
{
  "type": "video",
  "src": "/assets/videos/...",
  "title": "..."
}
```

### SmartArt
```json
{
  "type": "smart_art",
  "layout": "Icon Vertical Solid List",
  "nodes": [
    {
      "id": "...",
      "text": "Main text",
      "level": 1,
      "icon": "/assets/images/icons/...",
      "icon_alt": "...",
      "children": [
        { "id": "...", "text": "Sub text", "level": 2, ... }
      ]
    }
  ]
}
```

---

## Detection Logic (slideHelpers.ts)

```typescript
function getLayoutCategory(layout: string): 'title' | 'section' | 'sidebar' | 'media' | 'quote' | 'content' {
  const lowerLayout = layout.toLowerCase();

  if (lowerLayout.includes('section heading')) return 'section';
  if (lowerLayout.includes('title slide') || lowerLayout === 'title only') return 'title';
  if (lowerLayout.includes('sidebar') || lowerLayout.includes('side bar') || lowerLayout === 'half page') return 'sidebar';
  if (lowerLayout.includes('image') || lowerLayout.includes('screenshot') || lowerLayout.includes('video')) return 'media';
  if (lowerLayout === 'quote') return 'quote';

  return 'content';
}
```

---

## SmartArt Detection Logic (SmartArtDiagram.tsx)

```typescript
function getSmartArtCategory(layout: string, nodes: SmartArtNode[]): 'vertical-list' | 'horizontal-numbered' | 'horizontal-list' | 'circle-list' | 'default' {
  const layoutLower = layout.toLowerCase();

  // Horizontal numbered process
  if (layoutLower.includes('process') || layoutLower.includes('numbered') || layoutLower.includes('horizontal')) {
    return 'horizontal-numbered';
  }

  // Vertical list layouts
  if (layoutLower.includes('list') || layoutLower.includes('vertical') || layoutLower.includes('stacked') || layoutLower.includes('solid')) {
    return 'vertical-list';
  }

  // Circle layouts
  if (layoutLower.includes('circle')) {
    return 'circle-list';
  }

  // Empty layout - detect by structure
  if (!layout || layout.trim() === '') {
    const isSimpleList = nodes.every(n => !n.children?.length || n.children.every(c => !c.children?.length));
    if (isSimpleList) return 'vertical-list';
  }

  return 'default';
}
```

---

## Known Issues & TODO

### Resolved Issues
1. ~~**"Basic Linear Process Numbered"** renders as vertical bars instead of horizontal numbered cards~~ - **FIXED**: Added `HorizontalNumberedDiagram` component
2. ~~**SmartArt without layout** defaults to list style~~ - **FIXED**: Detects by node structure when layout is empty
3. ~~**Bold text in quotes** - need to ensure `runs` array is parsed~~ - **FIXED**: `BulletList` component parses runs for formatting
4. ~~**Statement slides** rendered with gradient background~~ - **FIXED**: Now uses left-aligned text on light background

### Current Issues
1. **Three-zone sidebar layouts** - Image + SmartArt combinations need careful width balancing
2. **Video in media gallery** - Videos play inline; may want lightbox option

### Needed Improvements
1. Consider adding zoom capability to statement slides for very long text
2. Better responsive handling for three-zone layouts on mobile

---

## Slide Examples

### Example: Sidebar with SmartArt (Slide 17)
- Layout: `Side bar title with text`
- Content: SmartArt with empty layout but simple nodes
- Should render: Dark blue cards filling the right side

### Example: Quote (Slide 23)
- Layout: `Quote`
- Content: List with `runs` containing bold markers
- Should render: Quote mark + text with bold preserved + attribution bar

### Example: Horizontal Numbered (Slide 3 - "Plan for the day")
- Layout: `Title Only`
- Content: SmartArt `Basic Linear Process Numbered`
- Data structure: Mixed nodes with level 0 (numbers) and level 1 (content)
- Should render: 5 horizontal cards with numbers in circles

### Example: Statement Slide (Slide 20)
- Layout: `Title only (for single text lines)`
- Content: None (empty content array)
- Title: "AI Hype: There is always AI hype but don't be a zealot or a nihilist"
- Should render: Left-aligned text on light background, with "AI Hype:" in bold

### Example: Statement Slide with Questions (Slide 74)
- Layout: `Title Only`
- Content: None
- Title: "What could it do? What it can do now?"
- Should render: Two questions on separate lines, left-aligned on light background

---

## File References

- **Layout detection**: `src/utils/slideHelpers.ts`
- **Slide components**: `src/components/slides/*.tsx`
- **SmartArt rendering**: `src/components/content/SmartArtDiagram.tsx`
- **Content rendering**: `src/components/content/ContentRenderer.tsx`
- **Type definitions**: `src/data/types.ts`
