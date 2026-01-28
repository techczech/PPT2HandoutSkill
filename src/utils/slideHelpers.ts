import type { Section, FlatSlide } from '../data/types';

export function flattenSlides(sections: Section[]): FlatSlide[] {
  const flat: FlatSlide[] = [];
  sections.forEach((section, sectionIndex) => {
    section.slides.forEach((slide) => {
      flat.push({
        ...slide,
        sectionTitle: section.title,
        sectionIndex,
        globalIndex: flat.length,
      });
    });
  });
  return flat;
}

export function getSectionBounds(sections: Section[]): { start: number; end: number; title: string }[] {
  const bounds: { start: number; end: number; title: string }[] = [];
  let currentIndex = 0;

  sections.forEach((section) => {
    bounds.push({
      title: section.title,
      start: currentIndex,
      end: currentIndex + section.slides.length - 1,
    });
    currentIndex += section.slides.length;
  });

  return bounds;
}

export function getLayoutCategory(layout: string, slideTitle?: string): 'title' | 'section' | 'sidebar' | 'media' | 'quote' | 'final' | 'license' | 'content' {
  const lowerLayout = layout.toLowerCase();
  const lowerTitle = (slideTitle || '').toLowerCase();

  // Special case: licensing slide (detect by title content)
  if (lowerTitle.includes('creative commons') || lowerTitle.includes('licensed under')) {
    return 'license';
  }

  // Special case: final/thank you slide
  if (lowerLayout.includes('final') || lowerTitle === 'thank you' || lowerTitle.startsWith('questions')) {
    return 'final';
  }

  if (lowerLayout.includes('section heading')) {
    return 'section';
  }
  if (lowerLayout.includes('title slide') || lowerLayout === 'title only (for single text lines)' || lowerLayout === 'title only') {
    return 'title';
  }
  if (lowerLayout.includes('sidebar') || lowerLayout.includes('side bar') || lowerLayout.includes('half page')) {
    return 'sidebar';
  }
  if (lowerLayout.includes('image') || lowerLayout.includes('screenshot') || lowerLayout.includes('video')) {
    return 'media';
  }
  if (lowerLayout === 'quote') {
    return 'quote';
  }

  return 'content';
}
