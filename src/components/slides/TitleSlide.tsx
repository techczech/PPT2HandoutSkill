import type { FlatSlide } from '../../data/types';
import ContentRenderer from '../content/ContentRenderer';

interface TitleSlideProps {
  slide: FlatSlide;
}

export default function TitleSlide({ slide }: TitleSlideProps) {
  return (
    <div
      className="h-full flex flex-col items-center justify-center p-10 md:p-16 text-white"
      style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)' }}
    >
      <h1
        className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 leading-tight"
        style={{ fontFamily: 'var(--font-serif)', maxWidth: '20ch' }}
      >
        {slide.title}
      </h1>
      <div className="max-w-2xl w-full space-y-5 text-center">
        {slide.content.filter(c => c.type !== 'heading').map((content, index) => (
          <ContentRenderer key={index} content={content} theme="dark" />
        ))}
      </div>
    </div>
  );
}
