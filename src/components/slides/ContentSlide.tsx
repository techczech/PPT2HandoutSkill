import type { FlatSlide, ImageContent, VideoContent } from '../../data/types';
import ContentRenderer from '../content/ContentRenderer';
import MediaGallery from '../content/MediaGallery';

interface ContentSlideProps {
  slide: FlatSlide;
}

// Render title with bold prefix (text before first colon or question mark)
function FormattedTitle({ text, className, style }: { text: string; className?: string; style?: React.CSSProperties }) {
  // Find natural break point - colon followed by space
  const colonMatch = text.match(/^([^:]+:)\s*(.+)$/);
  const questionMatch = text.match(/^([^?]+\?)\s*(.+)$/);

  if (colonMatch) {
    return (
      <p className={className} style={style}>
        <strong>{colonMatch[1]}</strong>{' '}{colonMatch[2]}
      </p>
    );
  }

  if (questionMatch) {
    // Multiple questions - split and render each
    const questions = text.split(/(?<=\?)\s+/);
    if (questions.length > 1) {
      return (
        <div className={className} style={style}>
          {questions.map((q, i) => (
            <p key={i} className={i > 0 ? 'mt-4' : ''}>{q}</p>
          ))}
        </div>
      );
    }
  }

  return <p className={className} style={style}>{text}</p>;
}

export default function ContentSlide({ slide }: ContentSlideProps) {
  const contentItems = slide.content.filter(c => c.type !== 'heading');
  const hasContent = contentItems.length > 0;

  // Separate media from other content
  const imageContent = contentItems.filter(c => c.type === 'image') as ImageContent[];
  const videoContent = contentItems.filter(c => c.type === 'video') as VideoContent[];
  const otherContent = contentItems.filter(c => {
    const type = (c as { type: string }).type;
    return type !== 'image' && type !== 'video' && type !== 'shape';
  });
  const hasMedia = imageContent.length > 0 || videoContent.length > 0;
  const hasText = otherContent.length > 0;

  // Title-only slide (statement slide): left-aligned text on light background
  if (!hasContent) {
    return (
      <div
        className="h-full flex items-center p-10 md:p-16 lg:p-20"
        style={{ background: 'var(--color-card)' }}
      >
        <div className="max-w-4xl">
          <FormattedTitle
            text={slide.title}
            className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl leading-relaxed font-normal"
            style={{ color: 'var(--color-primary)' }}
          />
        </div>
      </div>
    );
  }

  // Slide with media: use gallery layout
  if (hasMedia) {
    return (
      <div
        className="h-full flex flex-col"
        style={{ padding: 'var(--spacing-card)', background: 'var(--color-card)' }}
      >
        <h2
          className="text-2xl md:text-3xl font-bold mb-4 shrink-0"
          style={{ color: 'var(--color-primary)' }}
        >
          {slide.title}
        </h2>
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 overflow-hidden">
          {/* Media gallery - centered */}
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <MediaGallery images={imageContent} videos={videoContent} />
          </div>
          {/* Text content on right if any - vertically centered */}
          {hasText && (
            <div className="lg:w-2/5 shrink-0 flex items-center">
              <div className="space-y-4 w-full">
                {otherContent.map((content, index) => (
                  <ContentRenderer key={index} content={content} size="large" />
                ))}
              </div>
            </div>
          )}
        </div>
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
        style={{ color: 'var(--color-primary)' }}
      >
        {slide.title}
      </h2>
      <div className="flex-1 space-y-6 overflow-y-auto" style={{ maxWidth: '65ch' }}>
        {contentItems.map((content, index) => (
          <ContentRenderer key={index} content={content} size="large" />
        ))}
      </div>
    </div>
  );
}
