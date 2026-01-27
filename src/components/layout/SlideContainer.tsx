import { useNavigate } from 'react-router-dom';
import type { FlatSlide } from '../../data/types';
import SlideRenderer from '../slides/SlideRenderer';
import OutlineView from '../content/OutlineView';
import { useSlideViewMode } from '../../hooks/useSlideViewMode';
import { getScreenshotPath, hasScreenshot } from '../../utils/screenshotMapping';

interface SlideContainerProps {
  slide: FlatSlide;
}

export default function SlideContainer({ slide }: SlideContainerProps) {
  const { viewMode, setViewMode } = useSlideViewMode();
  const navigate = useNavigate();

  // Generate screenshot path using the mapping utility
  const slideOrder = slide.order || (slide.globalIndex + 1);
  const screenshotPath = getScreenshotPath(slideOrder);
  const slideHasScreenshot = hasScreenshot(slideOrder);

  return (
    <div className="flex flex-col h-full w-full">
      {/* View Toggle */}
      <div className="flex justify-center items-center gap-2 py-2 bg-gray-100 border-b">
        <button
          onClick={() => setViewMode('content')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
            viewMode === 'content'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50 border'
          }`}
        >
          Content
        </button>
        <button
          onClick={() => setViewMode('screenshot')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
            viewMode === 'screenshot'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50 border'
          }`}
        >
          Screenshot
        </button>
        <button
          onClick={() => setViewMode('outline')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
            viewMode === 'outline'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50 border'
          }`}
        >
          Outline
        </button>
        <div className="w-px h-6 bg-gray-300 mx-2" />
        <button
          onClick={() => navigate('/grid')}
          className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all bg-white text-gray-600 hover:bg-gray-50 border"
          title="Grid view (D)"
        >
          Grid
        </button>
        <span className="hidden sm:inline-flex items-center gap-1 text-xs text-gray-400 ml-4">
          <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded">←</kbd>
          <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded">→</kbd>
          <span className="mx-1">slide</span>
          <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded">↑</kbd>
          <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded">↓</kbd>
          <span className="mx-1">section</span>
          <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded">V</kbd>
          <span className="mx-1">view</span>
          <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded">G</kbd>
          <span className="mx-1">go to</span>
          <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded">D</kbd>
          <span>grid</span>
        </span>
      </div>

      {/* Slide Content */}
      <div className="slide-container flex-1 w-full bg-white rounded-lg shadow-lg overflow-hidden">
        {viewMode === 'content' ? (
          <SlideRenderer slide={slide} />
        ) : viewMode === 'screenshot' ? (
          <div className="h-full flex items-center justify-center p-4 bg-gray-900">
            {slideHasScreenshot && screenshotPath ? (
              <img
                src={screenshotPath}
                alt={`Slide ${slideOrder}: ${slide.title}`}
                className="max-h-full max-w-full object-contain rounded shadow-lg"
                onError={(e) => {
                  // If screenshot not found, show placeholder
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
        ) : (
          <OutlineView currentSlideIndex={slide.globalIndex} />
        )}
      </div>
    </div>
  );
}
