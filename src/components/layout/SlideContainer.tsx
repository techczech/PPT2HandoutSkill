import type { FlatSlide } from '../../data/types';
import SlideRenderer from '../slides/SlideRenderer';

interface SlideContainerProps {
  slide: FlatSlide;
}

export default function SlideContainer({ slide }: SlideContainerProps) {
  return (
    <div className="slide-container w-full bg-white rounded-lg shadow-lg overflow-hidden">
      <SlideRenderer slide={slide} />
    </div>
  );
}
