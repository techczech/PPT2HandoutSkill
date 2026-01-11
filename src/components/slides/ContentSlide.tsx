import type { FlatSlide } from '../../data/types';
import ContentRenderer from '../content/ContentRenderer';

interface ContentSlideProps {
  slide: FlatSlide;
}

export default function ContentSlide({ slide }: ContentSlideProps) {
  const contentItems = slide.content.filter(c => c.type !== 'heading');
  const hasContent = contentItems.length > 0;

  // Title-only slide: center the title vertically
  if (!hasContent) {
    return (
      <div
        className="h-full flex items-center justify-center"
        style={{ padding: 'var(--spacing-card)', background: 'var(--color-card)' }}
      >
        <h2
          className="text-2xl md:text-3xl font-bold text-center"
          style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-serif)' }}
        >
          {slide.title}
        </h2>
      </div>
    );
  }

  // Normal slide with content: title at top
  return (
    <div
      className="h-full flex flex-col overflow-y-auto"
      style={{ padding: 'var(--spacing-card)', background: 'var(--color-card)' }}
    >
      <h2
        className="text-2xl md:text-3xl font-bold mb-8 shrink-0"
        style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-serif)' }}
      >
        {slide.title}
      </h2>
      <div className="flex-1 space-y-6 overflow-y-auto" style={{ maxWidth: '55ch' }}>
        {contentItems.map((content, index) => (
          <ContentRenderer key={index} content={content} />
        ))}
      </div>
    </div>
  );
}
