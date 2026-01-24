# SmartArt Types Classification

This document classifies all SmartArt layouts found in presentations and describes how they should be rendered.

---

## Summary of SmartArt Layouts Found

| Layout Name | Count | Has Icons | Has Children | Current Status |
|-------------|-------|-----------|--------------|----------------|
| Icon Vertical Solid List | 22 | Yes | Yes | Working (vertical cards) |
| Icon Label Description List | 11 | Yes | Yes | Working (horizontal icons) |
| (empty layout) | 8 | Mixed | Mixed | Needs analysis |
| Icon Label List | 3 | Yes | No | Needs horizontal layout |
| Centered Icon Label Description List | 2 | Yes | Yes | Working (horizontal icons) |
| Icon Circle Label List | 2 | Yes | No | Needs circular icon layout |
| Basic Linear Process Numbered | 1 | No | Yes | Working (numbered cards) |
| Horizontal Action List | 1 | No | Yes | Needs horizontal flow |

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

#### 3a. Stats/Metrics Display (Slide 17)
**Slide**: 17 "Since 2022"
**Structure**: 3 nodes with icons, no children
**Content**: "1000+ people", "2000+ slides", "100+ presentations"
**Suggested rendering**: Horizontal stats with large numbers

```
┌─────────────────────────────────────────────────────────────┐
│    [icon]           [icon]           [icon]                 │
│    1000+            2000+            100+                   │
│    people           slides           presentations         │
└─────────────────────────────────────────────────────────────┘
```

#### 3b. Pyramid/Funnel Layout (Slide 35)
**Slide**: 35 "Levels of investment in technology adoption"
**Structure**: 3 nodes (Low/Medium/High investment) with children
**Content**: Hierarchical levels with sub-items
**Suggested rendering**: Vertical pyramid/chevron stack

```
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────┐        │
│  │ High investment                                  │        │
│  │   • Rethink how you work • Schedule learning    │        │
│  └─────────────────────────────────────────────────┘        │
│      ┌─────────────────────────────────────────┐            │
│      │ Medium investment                        │            │
│      │   • Create account • Configure settings  │            │
│      └─────────────────────────────────────────┘            │
│          ┌─────────────────────────────────────┐            │
│          │ Low investment                       │            │
│          │   • Learn a shortcut • Install app   │            │
│          └─────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

#### 3c. Grid/Tag Cloud (Slide 45)
**Slide**: 45 "Large Language Models"
**Structure**: 8 nodes, no icons, no children
**Content**: List of AI application areas (Music separation, Robotics, NLP, etc.)
**Suggested rendering**: Grid of boxes/tags

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

#### 3d. Annotated Gallery/Grid (Slide 53)
**Slide**: 53 "Researcher's AI Workbench"
**Structure**: 6 nodes with icons and children
**Content**: Tool names with feature descriptions
**Suggested rendering**: 2x3 or 3x2 grid of cards with icon, title, and bullet descriptions

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

#### 3e. Vertical Workflow/Process (Slides 177, 319)
**Slides**: 177 "Steps", 319 "Example: Qualitative Survey Data analysis"
**Structure**: 5-6 nodes, no icons, with or without children
**Content**: Sequential process steps
**Suggested rendering**: Vertical flow with arrows/connectors

```
┌─────────────────────────────────────────────────────────────┐
│     ┌─────────────────────────────────────┐                 │
│     │ Step 1: Pull out text items         │                 │
│     └──────────────────┬──────────────────┘                 │
│                        ▼                                    │
│     ┌─────────────────────────────────────┐                 │
│     │ Step 2: Send to LLM to identify     │                 │
│     └──────────────────┬──────────────────┘                 │
│                        ▼                                    │
│     ┌─────────────────────────────────────┐                 │
│     │ Step 3: LLM reads and assigns code  │                 │
│     └──────────────────┬──────────────────┘                 │
│                        ▼                                    │
│     ┌─────────────────────────────────────┐                 │
│     │ Step 4: Record theme codes          │                 │
│     └─────────────────────────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

#### 3f. Horizontal Timeline (Slide 341)
**Slide**: 341 "What to expect"
**Structure**: 3 nodes (Long term, Soon, Today) with children
**Content**: Time-based progression
**Suggested rendering**: Horizontal timeline with markers

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Today ──────────────► Soon ──────────────► Long term       │
│    │                     │                     │            │
│    ▼                     ▼                     ▼            │
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
**Current rendering**: Falls through to default
**Status**: Needs circular icon styling

**Slides**: 27, 36

**Characteristics**:
- 2 nodes with icons
- No children
- Icons should be in circles

**Example**: Slide 27 "How much time?" - items about time investment

**Suggested rendering**: Large circular icons with text below

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│      ╭──────╮                    ╭──────╮                   │
│      │ icon │                    │ icon │                   │
│      ╰──────╯                    ╰──────╯                   │
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

### 8. Horizontal Action List (1 instance)
**Current rendering**: Falls through to default
**Status**: Needs horizontal comparison layout

**Slide**: 194 "Key distinction"

**Characteristics**:
- 2 nodes (Humans vs Language Model)
- Has children for comparison points
- No icons

**Suggested rendering**: Two-column comparison

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│    ┌─────────────────┐        ┌─────────────────┐          │
│    │     Humans      │   vs   │  Language Model │          │
│    ├─────────────────┤        ├─────────────────┤          │
│    │ • Point 1       │        │ • Point 1       │          │
│    │ • Point 2       │        │ • Point 2       │          │
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

1. **High Priority** (user-reported issues):
   - Slide 319: Vertical workflow
   - Slide 341: Horizontal timeline
   - Slide 35: Pyramid/funnel
   - Slide 53: Annotated grid

2. **Medium Priority**:
   - Icon Circle Label List (slides 27, 36)
   - Horizontal Action List (slide 194)
   - Icon Label List (slides 19, 146, 297)

3. **Low Priority** (already working or rare):
   - Stats display (slide 17)
   - Grid layout (slide 45)

---

## Files to Modify

- `src/components/content/SmartArtDiagram.tsx` - Add new layout components
- `src/components/content/` - May need new component files for complex layouts
- `slidetypes.md` - Remove SmartArt section (moved here)
