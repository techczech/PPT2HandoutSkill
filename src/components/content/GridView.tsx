import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import presentationData from '../../data/presentation.json';
import type { Section, Slide } from '../../data/types';
import { getScreenshotPath } from '../../utils/screenshotMapping';
import SlideRenderer from '../slides/SlideRenderer';

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
type DisplayMode = 'rendered' | 'screenshot';

interface GridViewProps {
  onSlideClick?: (globalIndex: number) => void;
  onClose?: () => void;
  displayMode: DisplayMode;
}

export default function GridView({ onSlideClick, onClose, displayMode }: GridViewProps) {
  const [gridSize, setGridSize] = useState<GridSize>('medium');
  const [showSectionLabels, setShowSectionLabels] = useState(true);
  const navigate = useNavigate();

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
    if (onSlideClick) {
      onSlideClick(globalIndex);
    } else {
      navigate(`/slides/${globalIndex + 1}`);
    }
  };

  // Group slides by section
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
    <div className="h-full flex flex-col">
      {/* Grid toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>Slide Grid</h2>
          <span className="text-xs text-gray-400">{slides.length} slides</span>
          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500">
            {displayMode === 'rendered' ? 'Web View' : 'Screenshots'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Grid size toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {(['small', 'medium', 'large'] as GridSize[]).map((size) => (
              <button
                key={size}
                onClick={() => setGridSize(size)}
                className={`px-3 py-1 text-sm rounded ${gridSize === size ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
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
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm rounded bg-gray-200 text-gray-600 hover:bg-gray-300"
              title="Close grid (Esc)"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Grid content */}
      <div className="flex-1 overflow-auto p-4 bg-gray-100">
        {showSectionLabels ? (
          <div className="space-y-6 max-w-7xl mx-auto">
            {slidesBySection.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <div className="py-2 px-4 mb-3 rounded-lg" style={{ background: 'var(--color-primary)' }}>
                  <h3 className="text-base font-semibold text-white">
                    {section.title}
                    <span className="ml-2 text-sm font-normal text-white/70">({section.slides.length} slides)</span>
                  </h3>
                </div>
                <div className={`grid ${gridCols[gridSize]} gap-2`}>
                  {section.slides.map((slide) => (
                    <GridSlideCell
                      key={slide.globalIndex}
                      slide={slide}
                      size={thumbnailSize[gridSize]}
                      displayMode={displayMode}
                      onClick={() => handleSlideClick(slide.globalIndex)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`grid ${gridCols[gridSize]} gap-2 max-w-7xl mx-auto`}>
            {slides.map((slide) => (
              <GridSlideCell
                key={slide.globalIndex}
                slide={slide}
                size={thumbnailSize[gridSize]}
                displayMode={displayMode}
                onClick={() => handleSlideClick(slide.globalIndex)}
                showSectionBadge={slide.isFirstInSection}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GridSlideCell({
  slide,
  size,
  displayMode,
  onClick,
  showSectionBadge,
}: {
  slide: SlideWithMeta;
  size: string;
  displayMode: DisplayMode;
  onClick: () => void;
  showSectionBadge?: boolean;
}) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const slideOrder = slide.order || (slide.globalIndex + 1);
  const screenshotPath = getScreenshotPath(slideOrder) || '';

  if (displayMode === 'rendered') {
    return (
      <div
        className={`relative group cursor-pointer rounded overflow-hidden bg-white border border-gray-200 ${size}`}
        onClick={onClick}
      >
        {showSectionBadge && (
          <div className="absolute top-0 left-0 right-0 z-10 text-[10px] text-white px-1 py-0.5 truncate" style={{ background: 'var(--color-primary)' }}>
            {slide.sectionTitle}
          </div>
        )}
        <div className="w-full h-full origin-top-left" style={{ transform: 'scale(0.25)', width: '400%', height: '400%' }}>
          <SlideRenderer slide={{ ...slide, sectionTitle: slide.sectionTitle, sectionIndex: slide.sectionIndex, globalIndex: slide.globalIndex }} />
        </div>
        <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1 rounded z-10">
          {slideOrder}
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center z-10">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center px-2">
            <div className="text-white text-xs font-bold">#{slideOrder}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative group cursor-pointer rounded overflow-hidden bg-gray-200 ${size}`}
      onClick={onClick}
    >
      {showSectionBadge && (
        <div className="absolute top-0 left-0 right-0 z-10 text-[10px] text-white px-1 py-0.5 truncate" style={{ background: 'var(--color-primary)' }}>
          {slide.sectionTitle}
        </div>
      )}
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs animate-pulse">
          {slideOrder}
        </div>
      )}
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
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center px-2">
          <div className="text-white text-xs font-bold mb-1">#{slideOrder}</div>
          <div className="text-white text-[10px] line-clamp-2">{slide.title}</div>
        </div>
      </div>
      <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1 rounded">
        {slideOrder}
      </div>
    </div>
  );
}
