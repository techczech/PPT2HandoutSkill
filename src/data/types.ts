export interface Presentation {
  metadata: PresentationMetadata;
  sections: Section[];
}

export interface PresentationMetadata {
  id: string;
  source_file: string;
  processed_at: string;
  stats: {
    slide_count: number;
    image_count: number;
  };
}

export interface Section {
  title: string;
  slides: Slide[];
}

export interface Slide {
  order: number;
  title: string;
  layout: string;
  notes: string;
  content: ContentBlock[];
  layout_background?: string;
}

export type ContentBlock =
  | HeadingContent
  | ListContent
  | ImageContent
  | SmartArtContent
  | VideoContent
  | ShapeContent;

export interface HeadingContent {
  type: 'heading';
  text: string;
  level: number;
  runs?: TextRun[];
}

export interface ListContent {
  type: 'list';
  style: 'bullet' | 'numbered';
  items: ListItem[];
}

export interface TextRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
}

export interface ListItem {
  text: string;
  level: number;
  children: ListItem[];
  runs?: TextRun[];
}

export interface ImageContent {
  type: 'image';
  src: string;
  alt: string;
  caption: string;
  description?: string; // AI-generated description of image content
  category?: string; // AI-generated category (tweet, screenshot, diagram, etc.)
  quote_text?: string; // Extracted quote from image (tweets, messages, etc.)
  quote_attribution?: string; // Who said the quote
}

export interface SmartArtContent {
  type: 'smart_art';
  layout: string;
  nodes: SmartArtNode[];
}

export interface SmartArtNode {
  id: string;
  text: string;
  children: SmartArtNode[];
  level: number;
  icon: string | null;
  icon_alt: string | null;
}

export interface VideoContent {
  type: 'video';
  src: string;
  title: string;
}

export interface ShapeContent {
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

// Flattened slide with section info for navigation
export interface FlatSlide extends Slide {
  sectionTitle: string;
  sectionIndex: number;
  globalIndex: number;
}

// Navigation state
export interface NavigationState {
  currentIndex: number;
  totalSlides: number;
}

// ==========================================
// Resource Extraction Types
// ==========================================

export interface PersonResource {
  name: string;
  role?: string;
  organization?: string;
  slideIndex: number;
  context?: string;
}

export interface OrganizationResource {
  name: string;
  slideIndex: number;
  context?: string;
}

export interface PlaceResource {
  name: string;
  type: 'city' | 'country' | 'venue' | 'region';
  slideIndex: number;
  context?: string;
}

export interface DateResource {
  raw: string;
  formatted: string;
  year?: number;
  month?: string;
  event?: string;
  slideIndex: number;
  context?: string;
}

export interface QuoteResource {
  text: string;
  attribution?: string;
  slideIndex: number;
  slideTitle: string;
  extractedFromImage?: boolean;
  topic?: string;
}

export interface ImageResource {
  src: string;
  alt?: string;
  caption?: string;
  description?: string;
  slideIndex: number;
  slideTitle: string;
  sectionTitle: string;
}

export interface ToolResource {
  name: string;
  description?: string;
  url?: string;
}

export interface TermResource {
  term: string;
  context?: string;
}

export interface LinkResource {
  url: string;
  label: string;
  description?: string;
  slideIndex?: number;
  linkType?: string;
}

export interface ExtractedResources {
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
