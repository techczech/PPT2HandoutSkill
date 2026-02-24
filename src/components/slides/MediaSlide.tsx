import type { FlatSlide, ImageContent, VideoContent } from '../../data/types';
import ContentRenderer from '../content/ContentRenderer';
import MediaGallery from '../content/MediaGallery';

interface MediaSlideProps {
  slide: FlatSlide;
}

export default function MediaSlide({ slide }: MediaSlideProps) {
  // Separate media from other content — keep headings that aren't duplicates of the title
  const imageContent = slide.content.filter(c => c.type === 'image') as ImageContent[];
  const videoContent = slide.content.filter(c => c.type === 'video') as VideoContent[];
  const smartArtContent = slide.content.filter(c => c.type === 'smart_art');
  const textContent = slide.content.filter(c => {
    const type = (c as { type: string }).type;
    if (type === 'image' || type === 'video' || type === 'smart_art' || type === 'shape') return false;
    // Keep headings that aren't duplicates of the slide title
    if (type === 'heading') {
      return 'text' in c && (c as { text: string }).text !== slide.title;
    }
    return true;
  });

  const hasMedia = imageContent.length > 0 || videoContent.length > 0;
  const hasSmartArt = smartArtContent.length > 0;
  const hasDescription = textContent.length > 0;

  // Type 1: Media + SmartArt (e.g., slide 3 with photo + contact info)
  if (hasMedia && hasSmartArt) {
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
        {/* Media + SmartArt side by side */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
          <div className="flex-1 flex items-center justify-center p-4 md:p-6 overflow-hidden">
            <MediaGallery images={imageContent} videos={videoContent} />
          </div>
          <div className="lg:w-2/5 shrink-0 flex items-center p-4 md:p-6">
            <div className="w-full space-y-4">
              {smartArtContent.map((content, index) => (
                <ContentRenderer key={index} content={content} />
              ))}
              {textContent.map((content, index) => (
                <ContentRenderer key={`text-${index}`} content={content} size="large" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Type 2: Media only (no description text) - blue strip at top, media centered below
  if (!hasDescription && !hasSmartArt) {
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
          <MediaGallery images={imageContent} videos={videoContent} />
        </div>
      </div>
    );
  }

  // Type 3: SmartArt only (no media, no description)
  if (!hasMedia && hasSmartArt && !hasDescription) {
    return (
      <div className="h-full flex flex-col" style={{ background: 'var(--color-card)' }}>
        <div
          className="px-6 md:px-10 py-4 md:py-6 shrink-0"
          style={{ background: 'var(--color-primary)' }}
        >
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white text-center">
            {slide.title}
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 md:p-6 min-h-0 overflow-hidden">
          <div className="w-full max-w-4xl space-y-4">
            {smartArtContent.map((content, index) => (
              <ContentRenderer key={index} content={content} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Type 4: Media with description - blue strip at top, description left, media right
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
            {smartArtContent.map((content, index) => (
              <ContentRenderer key={`sa-${index}`} content={content} />
            ))}
          </div>
        </div>
        {/* Media area - right side */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-6 overflow-hidden">
          <MediaGallery images={imageContent} videos={videoContent} />
        </div>
      </div>
    </div>
  );
}
