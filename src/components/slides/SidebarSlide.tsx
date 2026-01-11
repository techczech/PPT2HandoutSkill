import type { FlatSlide } from '../../data/types';
import ContentRenderer from '../content/ContentRenderer';

interface SidebarSlideProps {
  slide: FlatSlide;
}

export default function SidebarSlide({ slide }: SidebarSlideProps) {
  return (
    <div className="h-full flex flex-col lg:flex-row">
      <div
        className="lg:w-2/5 p-8 md:p-12 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)', color: 'white' }}
      >
        <h2
          className="text-2xl md:text-3xl font-bold leading-tight text-center"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {slide.title}
        </h2>
      </div>
      <div className="flex-1 p-8 md:p-12 overflow-y-auto" style={{ background: 'var(--color-card)' }}>
        <div className="space-y-6" style={{ maxWidth: '50ch' }}>
          {slide.content.filter(c => c.type !== 'heading').map((content, index) => (
            <ContentRenderer key={index} content={content} />
          ))}
        </div>
      </div>
    </div>
  );
}
