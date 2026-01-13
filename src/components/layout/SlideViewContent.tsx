import { useNavigation } from '../../hooks/useNavigation';
import { useKeyboard } from '../../hooks/useKeyboard';
import Navigation from './Navigation';
import ProgressBar from './ProgressBar';
import SlideContainer from './SlideContainer';

export default function SlideViewContent() {
  const { currentSlide } = useNavigation();

  // Slide-specific keyboard navigation (arrows, space, home/end)
  useKeyboard();

  if (!currentSlide) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <ProgressBar />
      <main
        className="flex-1 flex items-center justify-center overflow-hidden"
        style={{ padding: 'var(--spacing-page-x)' }}
      >
        <SlideContainer slide={currentSlide} />
      </main>
      <Navigation />
    </div>
  );
}
