import type { FlatSlide, ImageContent, VideoContent } from '../../data/types';
import ContentRenderer from '../content/ContentRenderer';
import MediaGallery from '../content/MediaGallery';

interface MediaSlideProps {
  slide: FlatSlide;
}

export default function MediaSlide({ slide }: MediaSlideProps) {
  // Separate media from other content
  const imageContent = slide.content.filter(c => c.type === 'image') as ImageContent[];
  const videoContent = slide.content.filter(c => c.type === 'video') as VideoContent[];
  const smartArtContent = slide.content.filter(c => c.type === 'smart_art');
  const textContent = slide.content.filter(c => {
    const type = (c as { type: string }).type;
    return type !== 'image' && type !== 'video' && type !== 'smart_art' && type !== 'heading' && type !== 'shape';
  });

  const hasMedia = imageContent.length > 0 || videoContent.length > 0;
  const hasDescription = textContent.length > 0;

  // Type 1: Media only (no description) - blue strip at top, media centered below
  if (!hasDescription) {
    return (
      <div className="h-full flex flex-col" style={{ background: 'var(--color-card)' }}>
        {/* Blue title strip */}
        <div
          className="px-6 md:px-10 py-4 md:py-6 shrink-0"
          style={{ background: 'var(--color-primary)' }}
        >
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white text-center">
            {slide.title}
          </h2>
        </div>
        {/* Media area - centered */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-6 min-h-0 overflow-hidden">
          {hasMedia ? (
            <MediaGallery images={imageContent} videos={videoContent} />
          ) : (
            // SmartArt only
            <div className="w-full h-full flex flex-col gap-4 items-center justify-center">
              {smartArtContent.map((content, index) => (
                <div key={index} className="max-w-full max-h-full">
                  <ContentRenderer content={content} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Type 2: Media with description - blue strip at top, media left, gray description box right
  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-card)' }}>
      {/* Blue title strip */}
      <div
        className="px-6 md:px-10 py-4 md:py-6 shrink-0"
        style={{ background: 'var(--color-primary)' }}
      >
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white text-center">
          {slide.title}
        </h2>
      </div>
      {/* Content area - description left, media right */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Description box - left side, gray background, vertically centered */}
        <div
          className="lg:w-2/5 shrink-0 flex items-center p-6 md:p-8"
          style={{ background: 'var(--color-muted, #f3f4f6)' }}
        >
          <div className="space-y-4 w-full">
            {textContent.map((content, index) => (
              <ContentRenderer key={index} content={content} size="large" noBullets />
            ))}
          </div>
        </div>
        {/* Media area - right side */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-6 overflow-hidden">
          {hasMedia ? (
            <MediaGallery images={imageContent} videos={videoContent} />
          ) : (
            <div className="w-full h-full flex flex-col gap-4 items-center justify-center">
              {smartArtContent.map((content, index) => (
                <div key={index} className="max-w-full max-h-full">
                  <ContentRenderer content={content} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
