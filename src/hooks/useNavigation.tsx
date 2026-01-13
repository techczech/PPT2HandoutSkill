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
  currentSectionIndex: number;
  goToSlide: (index: number) => void;
  goToSection: (sectionIndex: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
  nextSection: () => void;
  prevSection: () => void;
  goToFirst: () => void;
  goToLast: () => void;
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

  // Determine which section we're currently in
  const currentSectionIndex = useMemo(() => {
    for (let i = 0; i < sectionBounds.length; i++) {
      if (currentIndex >= sectionBounds[i].start && currentIndex <= sectionBounds[i].end) {
        return i;
      }
    }
    return 0;
  }, [currentIndex, sectionBounds]);

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

  const nextSection = useCallback(() => {
    if (currentSectionIndex < sectionBounds.length - 1) {
      goToSection(currentSectionIndex + 1);
    }
  }, [currentSectionIndex, sectionBounds.length, goToSection]);

  const prevSection = useCallback(() => {
    if (currentSectionIndex > 0) {
      goToSection(currentSectionIndex - 1);
    }
  }, [currentSectionIndex, goToSection]);

  const goToFirst = useCallback(() => {
    goToSlide(0);
  }, [goToSlide]);

  const goToLast = useCallback(() => {
    goToSlide(totalSlides - 1);
  }, [goToSlide, totalSlides]);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalSlides - 1;

  const value = useMemo(() => ({
    currentIndex,
    flatSlides,
    sections,
    sectionBounds,
    currentSlide,
    currentSectionIndex,
    goToSlide,
    goToSection,
    nextSlide,
    prevSlide,
    nextSection,
    prevSection,
    goToFirst,
    goToLast,
    isFirst,
    isLast,
    totalSlides,
  }), [currentIndex, flatSlides, sections, sectionBounds, currentSlide, currentSectionIndex, goToSlide, goToSection, nextSlide, prevSlide, nextSection, prevSection, goToFirst, goToLast, isFirst, isLast, totalSlides]);

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
