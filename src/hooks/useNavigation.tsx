import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { FlatSlide, Section, Presentation } from '../data/types';
import { flattenSlides, getSectionBounds } from '../utils/slideHelpers';
import presentationData from '../data/presentation.json';

interface NavigationContextType {
  currentIndex: number;
  flatSlides: FlatSlide[];
  sections: Section[];
  sectionBounds: { start: number; end: number; title: string }[];
  currentSlide: FlatSlide | null;
  goToSlide: (index: number) => void;
  goToSection: (sectionIndex: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
  isFirst: boolean;
  isLast: boolean;
  totalSlides: number;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { slideNumber } = useParams<{ slideNumber: string }>();

  const presentation = presentationData as Presentation;
  const sections = presentation.sections;
  const flatSlides = useMemo(() => flattenSlides(sections), [sections]);
  const sectionBounds = useMemo(() => getSectionBounds(sections), [sections]);
  const totalSlides = flatSlides.length;

  // Parse current slide index from URL (1-indexed in URL, 0-indexed internally)
  const currentIndex = slideNumber ? Math.max(0, Math.min(parseInt(slideNumber, 10) - 1, totalSlides - 1)) : 0;
  const currentSlide = flatSlides[currentIndex] ?? null;

  const goToSlide = useCallback((index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, totalSlides - 1));
    navigate(`/slides/${clampedIndex + 1}`);
  }, [navigate, totalSlides]);

  const goToSection = useCallback((sectionIndex: number) => {
    const bound = sectionBounds[sectionIndex];
    if (bound) {
      goToSlide(bound.start);
    }
  }, [sectionBounds, goToSlide]);

  const nextSlide = useCallback(() => {
    if (currentIndex < totalSlides - 1) {
      goToSlide(currentIndex + 1);
    }
  }, [currentIndex, totalSlides, goToSlide]);

  const prevSlide = useCallback(() => {
    if (currentIndex > 0) {
      goToSlide(currentIndex - 1);
    }
  }, [currentIndex, goToSlide]);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalSlides - 1;

  const value = useMemo(() => ({
    currentIndex,
    flatSlides,
    sections,
    sectionBounds,
    currentSlide,
    goToSlide,
    goToSection,
    nextSlide,
    prevSlide,
    isFirst,
    isLast,
    totalSlides,
  }), [currentIndex, flatSlides, sections, sectionBounds, currentSlide, goToSlide, goToSection, nextSlide, prevSlide, isFirst, isLast, totalSlides]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
