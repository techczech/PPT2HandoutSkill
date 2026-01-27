import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import presentationData from '../data/presentation.json';
import type { Section, Slide } from '../data/types';
import { getScreenshotPath } from '../utils/screenshotMapping';

interface SlideWithMeta extends Slide {
  sectionTitle: string;
  sectionIndex: number;
  globalIndex: number;
  isFirstInSection: boolean;
}

function flattenSlidesWithSections(sections: Section[]): SlideWithMeta[] {
  const flat: SlideWithMeta[] = [];
  sections.forEach((section, sectionIndex) => {
    section.slides.forEach((slide, slideIndexInSection) => {
      flat.push({
        ...slide,
        sectionTitle: section.title,
        sectionIndex,
        globalIndex: flat.length,
        isFirstInSection: slideIndexInSection === 0,
      });
    });
  });
  return flat;
}

type GridSize = 'small' | 'medium' | 'large';

export default function GridPage() {
  const [gridSize, setGridSize] = useState<GridSize>('medium');
  const [showSectionLabels, setShowSectionLabels] = useState(true);
  const navigate = useNavigate();

  // Handle Esc key to go back to slides
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        navigate('/slides');
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const slides = flattenSlidesWithSections(presentationData.sections as Section[]);

  const gridCols: Record<GridSize, string> = {
    small: 'grid-cols-6 md:grid-cols-8 lg:grid-cols-10',
    medium: 'grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
    large: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  };

  const thumbnailSize: Record<GridSize, string> = {
    small: 'h-16',
    medium: 'h-28',
    large: 'h-44',
  };

  const handleSlideClick = (globalIndex: number) => {
    navigate(`/slides/${globalIndex + 1}`);  // URL uses 1-indexed slide numbers
  };

  // Group slides by section for rendering
  const slidesBySection: { title: string; slides: SlideWithMeta[] }[] = [];
  let currentSection = '';
  slides.forEach((slide) => {
    if (slide.sectionTitle !== currentSection) {
      currentSection = slide.sectionTitle;
      slidesBySection.push({ title: currentSection, slides: [] });
    }
    slidesBySection[slidesBySection.length - 1].slides.push(slide);
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/slides"
              className="text-gray-400 hover:text-gray-600"
              title="Back to Slides"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
              Slide Grid
            </h1>
            <span className="text-xs text-gray-400 hidden sm:inline">
              Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[10px]">D</kbd> from slides
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* Grid size toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {(['small', 'medium', 'large'] as GridSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setGridSize(size)}
                  className={`px-3 py-1 text-sm rounded ${
                    gridSize === size
                      ? 'bg-white shadow text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {size === 'small' ? 'S' : size === 'medium' ? 'M' : 'L'}
                </button>
              ))}
            </div>

            {/* Section labels toggle */}
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showSectionLabels}
                onChange={(e) => setShowSectionLabels(e.target.checked)}
                className="rounded"
              />
              Sections
            </label>

            {/* View links */}
            <Link
              to="/slides"
              className="text-sm px-3 py-1 rounded bg-primary text-white hover:opacity-90"
              style={{ background: 'var(--color-primary)' }}
            >
              Slides
            </Link>
          </div>
        </div>
      </header>

      {/* Grid content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {showSectionLabels ? (
          // Render with section dividers
          <div className="space-y-8">
            {slidesBySection.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                {/* Section header */}
                <div
                  className="sticky top-16 z-5 py-2 px-4 mb-4 rounded-lg"
                  style={{ background: 'var(--color-primary)' }}
                >
                  <h2 className="text-lg font-semibold text-white">
                    {section.title}
                    <span className="ml-2 text-sm font-normal text-white/70">
                      ({section.slides.length} slides)
                    </span>
                  </h2>
                </div>

                {/* Section slides */}
                <div className={`grid ${gridCols[gridSize]} gap-2`}>
                  {section.slides.map((slide) => (
                    <SlideThumb
                      key={slide.globalIndex}
                      slide={slide}
                      size={thumbnailSize[gridSize]}
                      onClick={() => handleSlideClick(slide.globalIndex)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Render flat grid
          <div className={`grid ${gridCols[gridSize]} gap-2`}>
            {slides.map((slide) => (
              <SlideThumb
                key={slide.globalIndex}
                slide={slide}
                size={thumbnailSize[gridSize]}
                onClick={() => handleSlideClick(slide.globalIndex)}
                showSectionBadge={slide.isFirstInSection}
              />
            ))}
          </div>
        )}

        {/* Summary */}
        <div className="mt-8 text-center text-sm text-gray-500">
          {slides.length} slides in {slidesBySection.length} sections
        </div>
      </main>
    </div>
  );
}

function SlideThumb({
  slide,
  size,
  onClick,
  showSectionBadge,
}: {
  slide: SlideWithMeta;
  size: string;
  onClick: () => void;
  showSectionBadge?: boolean;
}) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  // Use the centralized screenshot mapping utility
  const slideOrder = slide.order || (slide.globalIndex + 1);
  const screenshotPath = getScreenshotPath(slideOrder) || '';

  return (
    <div
      className={`relative group cursor-pointer rounded overflow-hidden bg-gray-200 ${size}`}
      onClick={onClick}
    >
      {/* Section badge for first slide */}
      {showSectionBadge && (
        <div
          className="absolute top-0 left-0 right-0 z-10 text-[10px] text-white px-1 py-0.5 truncate"
          style={{ background: 'var(--color-primary)' }}
        >
          {slide.sectionTitle}
        </div>
      )}

      {/* Loading placeholder */}
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs animate-pulse">
          {slideOrder}
        </div>
      )}

      {/* Thumbnail image with lazy loading */}
      {error ? (
        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
          {slideOrder}
        </div>
      ) : (
        <img
          src={screenshotPath}
          alt={slide.title}
          className={`w-full h-full object-cover transition-opacity ${loaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center px-2">
          <div className="text-white text-xs font-bold mb-1">#{slideOrder}</div>
          <div className="text-white text-[10px] line-clamp-2">{slide.title}</div>
        </div>
      </div>

      {/* Slide number badge */}
      <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1 rounded">
        {slideOrder}
      </div>
    </div>
  );
}
