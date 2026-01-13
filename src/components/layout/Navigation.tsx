import { useState, useRef, useEffect } from 'react';
import { useNavigation } from '../../hooks/useNavigation';

export default function Navigation() {
  const { prevSlide, nextSlide, isFirst, isLast, currentIndex, totalSlides, goToSlide } = useNavigation();
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleNumberClick = () => {
    setInputValue(String(currentIndex + 1));
    setIsEditing(true);
  };

  const handleInputSubmit = () => {
    const slideNum = parseInt(inputValue, 10);
    if (!isNaN(slideNum) && slideNum >= 1 && slideNum <= totalSlides) {
      goToSlide(slideNum - 1);
    }
    setIsEditing(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  return (
    <nav className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between">
      <button
        onClick={prevSlide}
        disabled={isFirst}
        className="nav-button"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="flex items-center gap-3">
        {/* Slide number display/input */}
        <div className="flex items-center gap-1 min-w-[80px] justify-center">
          {isEditing ? (
            <input
              ref={inputRef}
              type="number"
              min={1}
              max={totalSlides}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleInputSubmit}
              onKeyDown={handleInputKeyDown}
              className="w-14 px-2 py-1 text-center border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Go to slide number"
            />
          ) : (
            <button
              onClick={handleNumberClick}
              className="font-semibold text-gray-700 hover:text-blue-600 cursor-pointer transition-colors"
              title="Click to jump to slide"
            >
              {currentIndex + 1}
            </button>
          )}
          <span className="text-gray-400">/ {totalSlides}</span>
        </div>

        {/* Slider */}
        <input
          type="range"
          min={1}
          max={totalSlides}
          value={currentIndex + 1}
          onChange={(e) => goToSlide(parseInt(e.target.value, 10) - 1)}
          className="w-24 sm:w-32 md:w-48 accent-blue-600"
          aria-label="Slide progress"
        />
      </div>

      <button
        onClick={nextSlide}
        disabled={isLast}
        className="nav-button"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
}
