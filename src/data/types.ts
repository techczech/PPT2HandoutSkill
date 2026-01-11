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
}

export type ContentBlock =
  | HeadingContent
  | ListContent
  | ImageContent
  | SmartArtContent
  | VideoContent;

export interface HeadingContent {
  type: 'heading';
  text: string;
  level: number;
}

export interface ListContent {
  type: 'list';
  style: 'bullet' | 'numbered';
  items: ListItem[];
}

export interface ListItem {
  text: string;
  level: number;
  children: ListItem[];
}

export interface ImageContent {
  type: 'image';
  src: string;
  alt: string;
  caption: string;
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
