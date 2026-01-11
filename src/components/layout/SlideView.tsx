import { useNavigation } from '../../hooks/useNavigation';
import { useKeyboard } from '../../hooks/useKeyboard';
import Header from './Header';
import Navigation from './Navigation';
import ProgressBar from './ProgressBar';
import SlideContainer from './SlideContainer';

export default function SlideView() {
  useKeyboard();
  const { currentSlide } = useNavigation();

  if (!currentSlide) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />
      <ProgressBar />
      <main className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <SlideContainer slide={currentSlide} />
      </main>
      <Navigation />
    </div>
  );
}
