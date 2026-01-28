import { useEffect } from 'react';
import { useNavigation } from './useNavigation';
import { useSlideViewMode } from './useSlideViewMode';

/**
 * Slide-specific keyboard navigation (arrows, space, home/end).
 * Global shortcuts (/, h, m, s, r, ?) are handled by useGlobalKeyboard.
 */
export function useKeyboard() {
  const { nextSlide, prevSlide, nextSection, prevSection, goToFirst, goToLast, goToSlide, totalSlides } = useNavigation();
  const { mainView, setMainView, toggleDisplayMode } = useSlideViewMode();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Ignore if typing in an input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Only handle arrow/navigation keys for slides
      switch (event.key) {
        // Slide navigation: ← → Space PageDown PageUp
        case 'ArrowRight':
        case ' ':
        case 'PageDown':
          event.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          event.preventDefault();
          prevSlide();
          break;
        // Section navigation: ↑ ↓
        case 'ArrowDown':
          event.preventDefault();
          nextSection();
          break;
        case 'ArrowUp':
          event.preventDefault();
          prevSection();
          break;
        // First/Last slide: Home End
        case 'Home':
          event.preventDefault();
          goToFirst();
          break;
        case 'End':
          event.preventDefault();
          goToLast();
          break;
        // Content view: c
        case 'c':
          event.preventDefault();
          setMainView('content');
          break;
        // Outline view: o
        case 'o':
          event.preventDefault();
          setMainView('outline');
          break;
        // Grid view: d
        case 'd':
          if (!event.metaKey && !event.ctrlKey) {
            event.preventDefault();
            setMainView('grid');
          }
          break;
        // Toggle display mode (rendered/screenshot): v
        case 'v':
          event.preventDefault();
          toggleDisplayMode();
          break;
        // Go to slide: g
        case 'g':
          event.preventDefault();
          const input = prompt(`Go to slide (1-${totalSlides}):`);
          if (input) {
            const num = parseInt(input, 10);
            if (!isNaN(num) && num >= 1 && num <= totalSlides) {
              goToSlide(num - 1);
            }
          }
          break;
        // Escape returns to content view
        case 'Escape':
          if (mainView !== 'content') {
            event.preventDefault();
            setMainView('content');
          }
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, nextSection, prevSection, goToFirst, goToLast, setMainView, toggleDisplayMode, goToSlide, totalSlides, mainView]);
}
