import { useState, useMemo, useCallback } from 'react';
import type { Presentation, Section, Slide, ContentBlock, ListItem } from '../data/types';
import presentationData from '../data/presentation.json';

export interface SearchResult {
  slideIndex: number;
  sectionTitle: string;
  slideTitle: string;
  matchContext: string;
  matchType: 'title' | 'content' | 'notes';
}

/**
 * Extract all searchable text from a content block
 */
function extractTextFromContent(content: ContentBlock): string {
  switch (content.type) {
    case 'heading':
      return content.text;
    case 'list':
      return extractTextFromListItems(content.items);
    case 'image':
      return [content.alt, content.caption].filter(Boolean).join(' ');
    case 'video':
      return content.title || '';
    case 'smart_art':
      return content.nodes.map(node => extractTextFromSmartArtNode(node)).join(' ');
    default:
      return '';
  }
}

function extractTextFromListItems(items: ListItem[]): string {
  return items.map(item => {
    const childText = item.children ? extractTextFromListItems(item.children) : '';
    return [item.text, childText].filter(Boolean).join(' ');
  }).join(' ');
}

function extractTextFromSmartArtNode(node: { text: string; children?: typeof node[] }): string {
  const childText = node.children ? node.children.map(extractTextFromSmartArtNode).join(' ') : '';
  return [node.text, childText].filter(Boolean).join(' ');
}

/**
 * Get all searchable text from a slide
 */
function getSlideSearchableText(slide: Slide): { title: string; content: string; notes: string } {
  const contentText = slide.content.map(extractTextFromContent).join(' ');
  return {
    title: slide.title || '',
    content: contentText,
    notes: slide.notes || '',
  };
}

/**
 * Find matching context around a search term
 */
function getMatchContext(text: string, query: string, contextLength: number = 60): string {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) return '';

  const start = Math.max(0, index - contextLength / 2);
  const end = Math.min(text.length, index + query.length + contextLength / 2);

  let context = text.slice(start, end).trim();
  if (start > 0) context = '...' + context;
  if (end < text.length) context = context + '...';

  return context;
}

export function useSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const presentation = presentationData as Presentation;

  // Build a flat index of all slides with their searchable text
  const searchIndex = useMemo(() => {
    const index: Array<{
      slideIndex: number;
      sectionTitle: string;
      slideTitle: string;
      searchText: { title: string; content: string; notes: string };
    }> = [];

    let globalIndex = 0;
    presentation.sections.forEach((section: Section) => {
      section.slides.forEach((slide: Slide) => {
        index.push({
          slideIndex: globalIndex,
          sectionTitle: section.title,
          slideTitle: slide.title || 'Untitled',
          searchText: getSlideSearchableText(slide),
        });
        globalIndex++;
      });
    });

    return index;
  }, [presentation]);

  // Search through all slides
  const results = useMemo<SearchResult[]>(() => {
    if (!query || query.length < 2) return [];

    const lowerQuery = query.toLowerCase();
    const matches: SearchResult[] = [];

    searchIndex.forEach(entry => {
      const { title, content, notes } = entry.searchText;

      // Check title
      if (title.toLowerCase().includes(lowerQuery)) {
        matches.push({
          slideIndex: entry.slideIndex,
          sectionTitle: entry.sectionTitle,
          slideTitle: entry.slideTitle,
          matchContext: getMatchContext(title, query),
          matchType: 'title',
        });
        return; // Only one match per slide
      }

      // Check content
      if (content.toLowerCase().includes(lowerQuery)) {
        matches.push({
          slideIndex: entry.slideIndex,
          sectionTitle: entry.sectionTitle,
          slideTitle: entry.slideTitle,
          matchContext: getMatchContext(content, query),
          matchType: 'content',
        });
        return;
      }

      // Check notes
      if (notes.toLowerCase().includes(lowerQuery)) {
        matches.push({
          slideIndex: entry.slideIndex,
          sectionTitle: entry.sectionTitle,
          slideTitle: entry.slideTitle,
          matchContext: getMatchContext(notes, query),
          matchType: 'notes',
        });
      }
    });

    return matches.slice(0, 20); // Limit results
  }, [query, searchIndex]);

  const open = useCallback(() => {
    setIsOpen(true);
    setQuery('');
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
  }, []);

  return {
    isOpen,
    query,
    setQuery,
    results,
    open,
    close,
  };
}
