import { useEffect } from 'react';
import { useNavigation } from './useNavigation';

/**
 * Slide-specific keyboard navigation (arrows, space, home/end).
 * Global shortcuts (/, h, m, s, r, ?) are handled by useGlobalKeyboard.
 */
export function useKeyboard() {
  const { nextSlide, prevSlide, nextSection, prevSection, goToFirst, goToLast } = useNavigation();

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
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, nextSection, prevSection, goToFirst, goToLast]);
}
