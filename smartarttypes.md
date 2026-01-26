# SmartArt Types Classification

This document classifies all SmartArt layouts found in presentations and describes how they should be rendered.

---

## Summary of SmartArt Layouts Found

| Layout Name | Count | Has Icons | Has Children | Current Status |
|-------------|-------|-----------|--------------|----------------|
| Icon Vertical Solid List | 22 | Yes | Yes | Working (vertical cards) |
| Icon Label Description List | 11 | Yes | Yes | Working (horizontal icons) |
| (empty layout) | 8 | Mixed | Mixed | Working (auto-detected by structure) |
| Icon Label List | 3 | Yes | No | Working (horizontal icons) |
| Centered Icon Label Description List | 2 | Yes | Yes | Working (horizontal icons) |
| Icon Circle Label List | 2 | Yes | No | Working (horizontal icons - same as Icon Label) |
| Basic Linear Process Numbered | 1 | No | Yes | Working (numbered cards) |
| Horizontal Action List | 1 | No | Yes | Working (horizontal comparison cards) |

---

## Detailed Layout Types

### 1. Icon Vertical Solid List (22 instances)
**Current rendering**: Vertical stacked cards with light grey background, dark blue text
**Status**: Working correctly

**Slides**: 10, 14, 16, 30, 34, 39, 65, 71, 73, 86, 100, 134, 147, 150, 195, 198, 212, 280, 283, 338, 339, 342

**Characteristics**:
- 2-7 nodes with icons
- Usually has children (descriptions)
- Used for lists of concepts, tools, or categories

**Example**: Slide 65 "The current frontier of AI capabilities" - 5 items (Multimodality, Long Context, Reasoning, Tools, Agents)

```
┌───────────────────────────────────────────────────┐
│ [icon]  Main Text                    Description  │
├───────────────────────────────────────────────────┤
│ [icon]  Main Text                    Description  │
├───────────────────────────────────────────────────┤
│ [icon]  Main Text                    Description  │
└───────────────────────────────────────────────────┘
```

---

### 2. Icon Label Description List (11 instances)
**Current rendering**: Horizontal icons with title and description below
**Status**: Working correctly

**Slides**: 6, 37, 46, 47, 63, 67, 135, 162, 215, 216, 303

**Characteristics**:
- 1-4 nodes with icons
- Has children (descriptions)
- Used for comparing/contrasting concepts

**Example**: Slide 63 "AI capability is MO" - 2 items (Model, Orchestration)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│    [icon]                        [icon]                     │
│                                                             │
│    Title                         Title                      │
│    Description line 1            Description line 1         │
│    Description line 2            Description line 2         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 3. (Empty Layout) - Multiple Types (8 instances)

These need individual analysis based on structure:

#### 3a. Stats/Metrics Display (Slide 17) - IMPLEMENTED
**Slide**: 17 "Since 2022"
**Structure**: 3 nodes with icons, no children
**Content**: "1000+ people", "2000+ slides", "100+ presentations"
**Status**: Working - uses `StatsDisplayDiagram` component

**Detection Logic** (all must be true):
1. Empty layout (`layout === ""`)
2. Has icons (all nodes have icon)
3. No children (all nodes have 0 children)
4. Short text (all nodes < 30 chars)
5. Contains numbers (any node has digits)

**Only slide 17 matches** - very specific criteria ensures no false positives.

```typescript
function isStatsLayout(layout: string, nodes: SmartArtNode[]): boolean {
  if (layout && layout.trim() !== '') return false;
  const hasIcons = nodes.some(n => n.icon);
  const noChildren = nodes.every(n => !n.children || n.children.length === 0);
  const shortText = nodes.every(n => n.text.length < 30);
  const hasNumbers = nodes.some(n => /\d/.test(n.text));
  return hasIcons && noChildren && shortText && hasNumbers;
}
```

**Visual Design**: Horizontal row with large icons, bold numbers (split from text), smaller labels.

```
┌─────────────────────────────────────────────────────────────┐
│    [icon]           [icon]           [icon]                 │
│    1000+            2000+            100+                   │
│    people           slides           presentations         │
└─────────────────────────────────────────────────────────────┘
```

#### 3b. Ascending Arrow Layout (Slide 35) - IMPLEMENTED
**Slide**: 35 "Levels of investment in technology adoption"
**Structure**: 3 nodes (Low/Medium/High investment) with children
**Content**: Hierarchical levels with sub-items
**Status**: Working - uses `PyramidDiagram` component

**Detection**: 2-4 items with level-related keywords (low/medium/high/tier/basic/advanced) and children.

**Visual Design**: Three columns with ascending vertical positions, circles at top, widening gray wedge at bottom.

```
┌─────────────────────────────────────────────────────────────┐
│                                            ●                │
│                        ●                   High investment  │
│    ●                   Medium investment   • Rethink work   │
│    Low investment      • Create account    • Schedule time  │
│    • Learn shortcut    • Configure         • Change routine │
│    • Install app       • Watch tutorials                    │
│  ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁ │
│  ╲                  widening gray wedge                   ╱ │
└─────────────────────────────────────────────────────────────┘
```

**Implementation Notes**:
- Sort nodes by level: `low/basic` (1) → `medium/intermediate` (2) → `high/advanced` (3)
- Use margin-top classes for ascending effect: `['mt-32 md:mt-40', 'mt-16 md:mt-20', 'mt-0']`
- Widening wedge: SVG polygon `points="0,60 0,55 400,0 400,60"` with gray fill (#d1d5db)

#### 3c. Grid/Tag Cloud (Slide 45) - IMPLEMENTED
**Slide**: 45 "Large Language Models"
**Structure**: 8 nodes, no icons, no children
**Content**: List of AI application areas (Music separation, Robotics, NLP, etc.)
**Status**: Working - uses `TagGridDiagram` component

**Detection**: 6+ items, no icons, no children.

```
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Music     │  │  Robotics   │  │  Clinical   │          │
│  │ separation  │  │             │  │    risk     │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │    NLP      │  │  Computer   │  │   Image     │          │
│  │             │  │   Vision    │  │ recognition │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

#### 3d. Annotated Gallery/Grid (Slide 53) - IMPLEMENTED
**Slide**: 53 "Researcher's AI Workbench"
**Structure**: 6 nodes with icons and children
**Content**: Tool names with feature descriptions
**Status**: Working - uses `AnnotatedGridDiagram` component

**Detection**: 4-8 items with icons and children.

```
┌─────────────────────────────────────────────────────────────┐
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ [icon]           │  │ [icon]           │                 │
│  │ Google AI Studio │  │ ChatGPT          │                 │
│  │ • Long text      │  │ • Peer review    │                 │
│  │ • Multimodal     │  │ • Daily tasks    │                 │
│  └──────────────────┘  └──────────────────┘                 │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ [icon]           │  │ [icon]           │                 │
│  │ Elicit           │  │ NotebookLM       │                 │
│  │ • Literature     │  │ • Quick research │                 │
│  └──────────────────┘  └──────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

#### 3e. Vertical Workflow/Process (Slides 177, 319) - IMPLEMENTED
**Slides**: 177 "Steps", 319 "Example: Qualitative Survey Data analysis"
**Structure**: 5-6 nodes, no icons, with or without children
**Content**: Sequential process steps
**Status**: Working - uses `VerticalWorkflowDiagram` component

**Detection**: 4+ items + no icons + (avg text >= 40 chars OR has children)
- Slide 177: Short titles (avg 22 chars) but HAS children → matches
- Slide 319: Longer text (avg 55 chars), no children → matches

**Styling**: Light gray boxes (#e5e7eb), dark blue text, dark blue arrows (▼)

```
┌─────────────────────────────────────┐  ← #e5e7eb background
│ Step 1: Pull out text items         │  ← var(--color-primary) text
│   • child annotation                │  ← text-gray-600
└─────────────────┬───────────────────┘
                  ▼                      ← var(--color-primary)
┌─────────────────────────────────────┐
│ Step 2: Send to LLM to identify     │
└─────────────────┬───────────────────┘
                  ▼
┌─────────────────────────────────────┐
│ Step 3: Record theme codes          │
└─────────────────────────────────────┘
```

#### 3f. Horizontal Timeline (Slide 340) - IMPLEMENTED
**Slide**: 340 "What to expect"
**Structure**: 3 nodes (Long term, Soon, Today) with children
**Content**: Time-based progression
**Status**: Working - uses `HorizontalTimeline` component

**Detection**: Nodes contain time-related keywords (today, soon, long term, now, future, etc.)

**Rendering**: Horizontal timeline with connecting line, circle markers, phase labels, and content cards below.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Today ──────────────► Soon ──────────────► Long term       │
│    ●                     ●                     ●            │
│                                                             │
│  ┌──────────┐       ┌──────────┐       ┌──────────┐        │
│  │Menu of   │       │Choose    │       │Reflect   │        │
│  │options   │       │relevant  │       │Practice  │        │
│  │Learn that│       │Learn how │       │Learn to  │        │
│  └──────────┘       └──────────┘       └──────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 3g. Stacked List (Slide 196)
**Slide**: 196 "Levels of demand on shopping list"
**Structure**: 3 nodes, no icons, has children
**Content**: Cognitive load levels
**Suggested rendering**: Vertical stacked boxes (similar to pyramid)

---

### 4. Icon Label List (3 instances)
**Current rendering**: Falls through to horizontal or vertical
**Status**: Needs dedicated handling

**Slides**: 19, 146, 297

**Characteristics**:
- 2-3 nodes with icons
- NO children (just title text)
- Used for simple comparisons or labels

**Example**: Slide 19 "Problem" - 2 items about AI understanding

**Suggested rendering**: Horizontal icons with larger title text (no description area)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│    [icon]                        [icon]                     │
│                                                             │
│    Easy to use AI badly          Impossible to know         │
│    without understanding         how to use it well         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 5. Centered Icon Label Description List (2 instances)
**Current rendering**: Same as Icon Label Description List
**Status**: Working

**Slides**: 18, 318

**Characteristics**:
- 2 nodes with icons and children
- Center-aligned variant

---

### 6. Icon Circle Label List (2 instances)
**Current rendering**: Same as Icon Label Description List (horizontal icons)
**Status**: Working

**Slides**: 27, 36

**Characteristics**:
- 2 nodes with icons
- No children
- Originally had circular icon styling in PowerPoint

**Note**: Rendered using the same horizontal icon layout as Icon Label Description List. The circular styling is not replicated - standard icon display is used instead for consistency.

**Example**: Slide 27 "How much time?" - items about time investment

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│    [icon]                        [icon]                     │
│                                                             │
│    Just "spending time"          10 hours is                │
│    is not enough                 not enough                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 7. Basic Linear Process Numbered (1 instance)
**Current rendering**: Horizontal numbered cards
**Status**: Working

**Slide**: 3 "Plan for the day"

**Characteristics**:
- Mixed nodes: numbers (level 0) and content (level 1)
- Creates numbered sequence

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

---

### 8. Horizontal Action List (1 instance) - IMPLEMENTED
**Current rendering**: Side-by-side comparison cards
**Status**: Working - uses `HorizontalComparisonDiagram` component

**Slide**: 194 "Key distinction"

**Characteristics**:
- 2 nodes (Humans vs Language Model)
- Has children for comparison points
- No icons

**Detection**: Layout contains "action list" or "comparison", OR 2-3 items without icons that all have children.

**Rendering**: Side-by-side cards with centered title and bullet children.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│    ┌─────────────────┐        ┌─────────────────┐          │
│    │     Humans      │        │  Language Model │          │
│    │                 │        │                 │          │
│    │  Context =      │        │  Context = Text │          │
│    │  Text + Memory  │        │                 │          │
│    └─────────────────┘        └─────────────────┘          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Detection Logic

```typescript
function detectSmartArtType(layout: string, nodes: SmartArtNode[]): SmartArtType {
  const layoutLower = layout.toLowerCase();
  const nodeCount = nodes.length;
  const hasIcons = nodes.some(n => n.icon);
  const hasChildren = nodes.some(n => n.children?.length > 0);

  // Explicit layout patterns
  if (layoutLower.includes('process') || layoutLower.includes('numbered')) {
    return 'horizontal-numbered';
  }
  if (layoutLower.includes('horizontal') || layoutLower.includes('action')) {
    return 'horizontal-comparison';
  }
  if (layoutLower.includes('circle')) {
    return 'circular-icons';
  }
  if (layoutLower.includes('vertical') || layoutLower.includes('solid')) {
    return 'vertical-list';
  }
  if (layoutLower.includes('icon label description') || layoutLower.includes('centered icon')) {
    return nodeCount <= 4 ? 'horizontal-icons' : 'vertical-list';
  }
  if (layoutLower.includes('icon label list')) {
    return 'horizontal-icons-simple';
  }

  // Empty layout - detect by structure
  if (!layout || layout.trim() === '') {
    // Timeline detection: nodes have time-related text
    const isTimeline = nodes.some(n =>
      /today|soon|long term|short term|now|future|past/i.test(n.text)
    );
    if (isTimeline) return 'horizontal-timeline';

    // Workflow detection: many sequential steps without icons
    if (nodeCount >= 5 && !hasIcons) {
      return 'vertical-workflow';
    }

    // Grid detection: many items, no hierarchy
    if (nodeCount >= 6 && !hasChildren) {
      return 'grid';
    }

    // Annotated gallery: icons with children, moderate count
    if (hasIcons && hasChildren && nodeCount >= 4 && nodeCount <= 8) {
      return 'annotated-grid';
    }

    // Pyramid/funnel: hierarchical with level-related text
    const isPyramid = nodes.some(n =>
      /low|medium|high|level|tier/i.test(n.text)
    );
    if (isPyramid && hasChildren) {
      return 'pyramid';
    }

    // Stats: icons, no children, short numeric text
    if (hasIcons && !hasChildren && nodes.every(n => n.text.length < 30)) {
      return 'stats-display';
    }

    // Default to vertical list
    return 'vertical-list';
  }

  return 'default';
}
```

---

## Priority Implementation Order

**All SmartArt layouts are now implemented!**

1. **Explicit Layout Names** (detected by layout string):
   - ✓ Icon Vertical Solid List - `GroupedCardNode` (vertical cards)
   - ✓ Icon Label Description List - `HorizontalIconDiagram`
   - ✓ Icon Label List - `HorizontalIconDiagram`
   - ✓ Icon Circle Label List - `HorizontalIconDiagram`
   - ✓ Centered Icon Label Description List - `HorizontalIconDiagram`
   - ✓ Basic Linear Process Numbered - `HorizontalNumberedDiagram`
   - ✓ Horizontal Action List - `HorizontalComparisonDiagram`

2. **Empty Layout** (auto-detected by structure):
   - ✓ Timeline (time keywords + children) - `HorizontalTimeline`
   - ✓ Pyramid (level keywords + children) - `PyramidDiagram`
   - ✓ Stats Display (icons, no children, numbers) - `StatsDisplayDiagram`
   - ✓ Annotated Grid (4-8 items, icons, children) - `AnnotatedGridDiagram`
   - ✓ Vertical Workflow (4+ items, no icons, no children) - `VerticalWorkflowDiagram`
   - ✓ Tag Grid (6+ items, no icons, no children) - `TagGridDiagram`
   - ✓ Vertical List (fallback) - `GroupedCardNode`

---

## Files to Modify

- `src/components/content/SmartArtDiagram.tsx` - Add new layout components
- `src/components/content/` - May need new component files for complex layouts
- `slidetypes.md` - Remove SmartArt section (moved here)
