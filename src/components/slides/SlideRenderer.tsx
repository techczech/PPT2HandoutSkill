import type { FlatSlide } from '../../data/types';
import { getLayoutCategory } from '../../utils/slideHelpers';
import TitleSlide from './TitleSlide';
import SectionHeader from './SectionHeader';
import SidebarSlide from './SidebarSlide';
import MediaSlide from './MediaSlide';
import QuoteSlide from './QuoteSlide';
import ContentSlide from './ContentSlide';

interface SlideRendererProps {
  slide: FlatSlide;
}

export default function SlideRenderer({ slide }: SlideRendererProps) {
  const category = getLayoutCategory(slide.layout);

  switch (category) {
    case 'title':
      return <TitleSlide slide={slide} />;
    case 'section':
      return <SectionHeader slide={slide} />;
    case 'sidebar':
      return <SidebarSlide slide={slide} />;
    case 'media':
      return <MediaSlide slide={slide} />;
    case 'quote':
      return <QuoteSlide slide={slide} />;
    default:
      return <ContentSlide slide={slide} />;
  }
}
