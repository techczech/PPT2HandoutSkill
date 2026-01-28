import type { FlatSlide } from '../../data/types';

interface SectionHeaderProps {
  slide: FlatSlide;
}

export default function SectionHeader({ slide }: SectionHeaderProps) {
  const isBlue = slide.layout.toLowerCase().includes('blue');

  return (
    <div
      className="h-full flex flex-col items-center justify-center p-10 md:p-16"
      style={{
        background: isBlue
          ? 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)'
          : 'linear-gradient(135deg, var(--color-surface) 0%, #fff 100%)',
        color: isBlue ? 'white' : 'var(--color-text)',
      }}
    >
      <div className="text-center max-w-2xl">
        <p
          className="text-sm uppercase tracking-widest mb-6 font-medium"
          style={{ color: isBlue ? 'rgba(255,255,255,0.6)' : 'var(--color-text-muted)' }}
        >
          Section
        </p>
        <h2
          className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          {slide.title}
        </h2>
      </div>
    </div>
  );
}
