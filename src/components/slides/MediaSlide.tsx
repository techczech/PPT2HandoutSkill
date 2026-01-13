import type { FlatSlide } from '../../data/types';
import ContentRenderer from '../content/ContentRenderer';

interface MediaSlideProps {
  slide: FlatSlide;
}

export default function MediaSlide({ slide }: MediaSlideProps) {
  const mediaContent = slide.content.filter(
    c => c.type === 'image' || c.type === 'video' || c.type === 'smart_art'
  );
  const otherContent = slide.content.filter(
    c => c.type !== 'image' && c.type !== 'video' && c.type !== 'smart_art' && c.type !== 'heading'
  );

  return (
    <div className="h-full flex flex-col p-8 md:p-12" style={{ background: 'var(--color-card)' }}>
      <h2
        className="text-2xl md:text-3xl font-bold mb-8 shrink-0"
        style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-serif)' }}
      >
        {slide.title}
      </h2>
      <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0 overflow-hidden">
        {/* Media area */}
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <div className="w-full h-full flex flex-wrap gap-6 items-center justify-center overflow-auto">
            {mediaContent.map((content, index) => (
              <div key={index} className="max-w-full max-h-full">
                <ContentRenderer content={content} />
              </div>
            ))}
          </div>
        </div>
        {/* Text content if any - larger text for readability alongside media */}
        {otherContent.length > 0 && (
          <div className="lg:w-2/5 shrink-0 overflow-y-auto media-slide-text">
            <div className="space-y-5">
              {otherContent.map((content, index) => (
                <ContentRenderer key={index} content={content} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
