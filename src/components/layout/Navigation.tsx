import { useNavigation } from '../../hooks/useNavigation';

export default function Navigation() {
  const { prevSlide, nextSlide, isFirst, isLast, currentIndex, totalSlides, goToSlide } = useNavigation();

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

      <div className="flex items-center gap-2">
        <input
          type="range"
          min={1}
          max={totalSlides}
          value={currentIndex + 1}
          onChange={(e) => goToSlide(parseInt(e.target.value, 10) - 1)}
          className="w-32 sm:w-48 md:w-64 accent-blue-600"
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
