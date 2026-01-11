import type { FlatSlide } from '../../data/types';
import ContentRenderer from '../content/ContentRenderer';

interface QuoteSlideProps {
  slide: FlatSlide;
}

export default function QuoteSlide({ slide }: QuoteSlideProps) {
  return (
    <div
      className="h-full flex flex-col items-center justify-center p-10 md:p-16 quote-slide"
      style={{ background: 'linear-gradient(135deg, #fef7f0 0%, #fff 100%)' }}
    >
      <div className="max-w-3xl">
        <blockquote
          className="text-2xl md:text-3xl italic leading-relaxed pl-6"
          style={{
            color: 'var(--color-text)',
            borderLeft: '4px solid var(--color-accent)',
          }}
        >
          {slide.title}
        </blockquote>
        {slide.content.filter(c => c.type !== 'heading').length > 0 && (
          <div className="mt-8 space-y-5 pl-6">
            {slide.content.filter(c => c.type !== 'heading').map((content, index) => (
              <ContentRenderer key={index} content={content} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
