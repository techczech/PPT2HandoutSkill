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
**Rendering**: Title at top, media centered below, optional description sidebar

### 6. Content Slides (Default)
**Detection**: Layout contains "title only", "text only", or doesn't match other categories
**Examples**:
- `Title only (for single text lines)` (81 slides)
- `Title Only` (25 slides)
- `Text only with title` (1 slide)
**Rendering**:
- If no content → full gradient background with centered title
- If has content → title at top, content below (max-width constrained)

---

## SmartArt Layout Types

SmartArt diagrams require special rendering based on their layout type.

### 1. Vertical List Layouts
**Detection**: Layout contains "list", "vertical", "stacked", or "solid"
**Examples**:
- `Icon Vertical Solid List` (22 instances)
- `Icon Label Description List` (11 instances)
- `Icon Label List` (3 instances)
- `Centered Icon Label Description List` (2 instances)
- Empty layout `""` with simple node structure (8 instances)

**Rendering**: Stacked cards (dark blue background, white text)
```
┌─────────────────────────────────┐
│ [icon]  Main Text    Child Text │
├─────────────────────────────────┤
│ [icon]  Main Text    Child Text │
├─────────────────────────────────┤
│ [icon]  Main Text    Child Text │
└─────────────────────────────────┘
```

### 2. Horizontal Process/Numbered Layouts
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

### Current Issues
1. **"Basic Linear Process Numbered"** renders as vertical bars instead of horizontal numbered cards
2. **SmartArt without layout** defaults to list style but may need different handling
3. **Bold text in quotes** - need to ensure `runs` array is parsed for formatting

### Needed Improvements
1. Add horizontal SmartArt rendering component
2. Better detection of numbered vs non-numbered layouts
3. Handle "Horizontal Action List" layout
4. Consider extracting number nodes separately from content nodes in numbered layouts

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

---

## File References

- **Layout detection**: `src/utils/slideHelpers.ts`
- **Slide components**: `src/components/slides/*.tsx`
- **SmartArt rendering**: `src/components/content/SmartArtDiagram.tsx`
- **Content rendering**: `src/components/content/ContentRenderer.tsx`
- **Type definitions**: `src/data/types.ts`
