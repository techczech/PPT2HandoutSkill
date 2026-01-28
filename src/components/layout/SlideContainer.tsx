import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FlatSlide } from '../../data/types';
import SlideRenderer from '../slides/SlideRenderer';
import OutlineView from '../content/OutlineView';
import GridView from '../content/GridView';
import PrintModal from '../PrintModal';
import { useSlideViewMode } from '../../hooks/useSlideViewMode';
import { getScreenshotPath, hasScreenshot } from '../../utils/screenshotMapping';

interface SlideContainerProps {
  slide: FlatSlide;
}

export default function SlideContainer({ slide }: SlideContainerProps) {
  const { mainView, setMainView, displayMode, toggleDisplayMode } = useSlideViewMode();
  const [showPrintModal, setShowPrintModal] = useState(false);
  const navigate = useNavigate();

  const slideOrder = slide.order || (slide.globalIndex + 1);
  const screenshotPath = getScreenshotPath(slideOrder);
  const slideHasScreenshot = hasScreenshot(slideOrder);

  const handleGridSlideClick = (globalIndex: number) => {
    setMainView('content');
    navigate(`/slides/${globalIndex + 1}`);
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* View Toggle */}
      <div className="flex justify-center items-center gap-2 py-2 bg-gray-100 border-b print:hidden">
        {/* Main view buttons */}
        <button
          onClick={() => setMainView('content')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
            mainView === 'content'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50 border'
          }`}
          title="Content view (C)"
        >
          Content
        </button>
        <button
          onClick={() => setMainView('outline')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
            mainView === 'outline'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50 border'
          }`}
          title="Outline view (O)"
        >
          Outline
        </button>
        <button
          onClick={() => setMainView('grid')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
            mainView === 'grid'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50 border'
          }`}
          title="Grid view (D)"
        >
          Grid
        </button>

        {/* Display mode toggle (for content and grid views) */}
        {mainView !== 'outline' && (
          <>
            <div className="w-px h-6 bg-gray-300 mx-2" />
            <button
              onClick={toggleDisplayMode}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                displayMode === 'screenshot'
                  ? 'bg-amber-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border'
              }`}
              title="Toggle screenshot/rendered (V)"
            >
              {displayMode === 'screenshot' ? 'Switch to Web View' : 'Switch to Screenshot'}
            </button>
          </>
        )}

        <div className="w-px h-6 bg-gray-300 mx-2" />
        <button
          onClick={() => setShowPrintModal(true)}
          className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all bg-white text-gray-600 hover:bg-gray-50 border"
          title="Export PDF"
        >
          PDF
        </button>
        <span className="hidden lg:inline-flex items-center gap-2 text-xs text-gray-400 ml-4">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded font-mono">←</kbd>
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded font-mono">→</kbd>
            <span>slide</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded font-mono">↑</kbd>
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded font-mono">↓</kbd>
            <span>section</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded font-mono">C</kbd>
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded font-mono">O</kbd>
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded font-mono">D</kbd>
            <span>view</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded font-mono">V</kbd>
            <span>web/screenshot</span>
          </span>
        </span>
      </div>

      {/* Grid View */}
      {mainView === 'grid' && (
        <div className="flex-1 w-full overflow-hidden print:hidden">
          <GridView
            onSlideClick={handleGridSlideClick}
            onClose={() => setMainView('content')}
            displayMode={displayMode}
          />
        </div>
      )}

      {/* Outline View */}
      {mainView === 'outline' && (
        <div className="flex-1 w-full overflow-hidden">
          <OutlineView currentSlideIndex={slide.globalIndex} />
        </div>
      )}

      {/* Content View */}
      {mainView === 'content' && (
        <div className="slide-container flex-1 w-full bg-white rounded-lg shadow-lg overflow-hidden">
          {displayMode === 'rendered' ? (
            <SlideRenderer slide={slide} />
          ) : (
            <div className="h-full flex items-center justify-center p-4 bg-gray-900">
              {slideHasScreenshot && screenshotPath ? (
                <img
                  src={screenshotPath}
                  alt={`Slide ${slideOrder}: ${slide.title}`}
                  className="max-h-full max-w-full object-contain rounded shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="%23f3f4f6" width="400" height="300"/><text x="200" y="150" text-anchor="middle" fill="%239ca3af" font-size="16">Screenshot not available</text></svg>';
                  }}
                />
              ) : (
                <div className="text-center text-gray-400">
                  <p className="text-lg">Screenshot not available</p>
                  <p className="text-sm mt-2">Slide {slideOrder}: {slide.title}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Print Modal */}
      <PrintModal isOpen={showPrintModal} onClose={() => setShowPrintModal(false)} />
    </div>
  );
}
