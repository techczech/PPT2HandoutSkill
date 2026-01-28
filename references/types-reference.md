# Types Reference

TypeScript type definitions used in the PPT2Handout system. Source: `src/data/types.ts`

## Core Presentation Types

### Presentation
Root type containing sections and metadata.
```typescript
interface Presentation {
  metadata: PresentationMetadata;
  sections: Section[];
}
```

### PresentationMetadata
```typescript
interface PresentationMetadata {
  id: string;
  source_file: string;
  processed_at: string;
  stats: {
    slide_count: number;
    image_count: number;
  };
}
```

### Section
Named group of slides.
```typescript
interface Section {
  title: string;
  slides: Slide[];
}
```

### Slide
Individual slide with order, title, layout, notes, content.
```typescript
interface Slide {
  order: number;
  title: string;
  layout: string;
  notes: string;
  content: ContentBlock[];
  layout_background?: string;
}
```

### FlatSlide
Slide with navigation metadata.
```typescript
interface FlatSlide extends Slide {
  sectionTitle: string;
  sectionIndex: number;
  globalIndex: number;
}
```

## Content Block Types

Union type for all content:
```typescript
type ContentBlock =
  | HeadingContent
  | ListContent
  | ImageContent
  | SmartArtContent
  | VideoContent
  | ShapeContent;
```

### HeadingContent
```typescript
interface HeadingContent {
  type: 'heading';
  text: string;
  level: number;
  runs?: TextRun[];
}
```

### ListContent
```typescript
interface ListContent {
  type: 'list';
  style: 'bullet' | 'numbered';
  items: ListItem[];
}

interface ListItem {
  text: string;
  level: number;
  children: ListItem[];
  runs?: TextRun[];
}
```

### TextRun
Formatted text segment within headings or list items.
```typescript
interface TextRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
}
```

### ImageContent
```typescript
interface ImageContent {
  type: 'image';
  src: string;
  alt: string;
  caption: string;
  description?: string;      // AI-generated description
  category?: string;         // AI-generated category (tweet, screenshot, diagram, etc.)
  quote_text?: string;       // Extracted quote from image
  quote_attribution?: string; // Quote attribution
}
```

### SmartArtContent
```typescript
interface SmartArtContent {
  type: 'smart_art';
  layout: string;
  nodes: SmartArtNode[];
}

interface SmartArtNode {
  id: string;
  text: string;
  children: SmartArtNode[];
  level: number;
  icon: string | null;
  icon_alt: string | null;
}
```

### VideoContent
```typescript
interface VideoContent {
  type: 'video';
  src: string;
  title: string;
}
```

### ShapeContent
```typescript
interface ShapeContent {
  type: 'shape';
  shape_type: string;
  shape_name: string;
  position: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  fill_color: string;
}
```

## Resource Extraction Types

These types are used for the entities.json file and Resources page.

### PersonResource
```typescript
interface PersonResource {
  name: string;
  role?: string;
  organization?: string;
  slideIndex: number;
  context?: string;
}
```

### OrganizationResource
```typescript
interface OrganizationResource {
  name: string;
  slideIndex: number;
  context?: string;
}
```

### QuoteResource
```typescript
interface QuoteResource {
  text: string;
  attribution?: string;
  slideIndex: number;
  slideTitle: string;
  extractedFromImage?: boolean;
  topic?: string;
}
```

### ToolResource
```typescript
interface ToolResource {
  name: string;
  description?: string;
  url?: string;
}
```

### LinkResource
```typescript
interface LinkResource {
  url: string;
  label: string;
  description?: string;
  slideIndex?: number;
  linkType?: string;
}
```

### DateResource
```typescript
interface DateResource {
  raw: string;
  formatted: string;
  year?: number;
  month?: string;
  event?: string;
  slideIndex: number;
  context?: string;
}
```

### PlaceResource
```typescript
interface PlaceResource {
  name: string;
  type: 'city' | 'country' | 'venue' | 'region';
  slideIndex: number;
  context?: string;
}
```

### ImageResource
```typescript
interface ImageResource {
  src: string;
  alt?: string;
  caption?: string;
  description?: string;
  slideIndex: number;
  slideTitle: string;
  sectionTitle: string;
}
```

### TermResource
```typescript
interface TermResource {
  term: string;
  context?: string;
}
```

### ExtractedResources
Container for all extracted entities.
```typescript
interface ExtractedResources {
  people: PersonResource[];
  organizations: OrganizationResource[];
  places: PlaceResource[];
  dates: DateResource[];
  quotes: QuoteResource[];
  images: ImageResource[];
  tools: ToolResource[];
  terms: TermResource[];
  links: LinkResource[];
}
```

## Navigation Types

### NavigationState
```typescript
interface NavigationState {
  currentIndex: number;
  totalSlides: number;
}
```
