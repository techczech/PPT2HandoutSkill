import type { FlatSlide, ImageContent, VideoContent, ShapeContent } from '../../data/types';
import ContentRenderer from '../content/ContentRenderer';
import MediaGallery from '../content/MediaGallery';
import ShapeBlock from '../content/ShapeBlock';

interface SidebarSlideProps {
  slide: FlatSlide;
}

export default function SidebarSlide({ slide }: SidebarSlideProps) {
  const contentItems = slide.content.filter(c => c.type !== 'heading');

  // Separate media from other content
  const imageContent = contentItems.filter(c => c.type === 'image') as ImageContent[];
  const videoContent = contentItems.filter(c => c.type === 'video') as VideoContent[];
  const smartArtContent = contentItems.filter(c => c.type === 'smart_art');
  const listContent = contentItems.filter(c => c.type === 'list');
  const shapeContent = contentItems.filter(c => c.type === 'shape') as ShapeContent[];

  const hasMedia = imageContent.length > 0 || videoContent.length > 0;
  const hasSmartArt = smartArtContent.length > 0;
  const hasShapes = shapeContent.length > 0;
  const hasText = listContent.length > 0;

  // Special case: SmartArt + shape = three-zone layout (sidebar | shape | smartart)
  // e.g., slide 45 "Large Language Models" with ≠ symbol
  if (hasSmartArt && hasShapes && !hasMedia) {
    return (
      <div className="h-full flex flex-col lg:flex-row lg:items-stretch">
        {/* Blue sidebar with title */}
        <div
          className="lg:w-1/3 p-6 md:p-8 flex items-center min-h-[150px]"
          style={{ background: 'var(--color-primary)', color: 'white' }}
        >
          <h2 className="text-2xl md:text-4xl font-normal leading-tight text-left">
            {slide.title}
          </h2>
        </div>
        {/* Center: Shape (e.g., ≠ symbol) */}
        <div
          className="lg:w-1/6 p-4 md:p-6 flex items-center justify-center"
          style={{ background: 'var(--color-card)' }}
        >
          {shapeContent.map((shape, index) => (
            <ShapeBlock key={index} content={shape} />
          ))}
        </div>
        {/* Right: SmartArt */}
        <div
          className="lg:flex-1 p-4 md:p-6 flex items-center justify-center"
          style={{ background: 'var(--color-card)' }}
        >
          <div className="w-full">
            {smartArtContent.map((content, index) => (
              <ContentRenderer key={index} content={content} fillSpace />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Special case: image + SmartArt = three-zone layout (sidebar | image | smartart)
  if (hasMedia && hasSmartArt) {
    return (
      <div className="h-full flex flex-col lg:flex-row lg:items-stretch">
        {/* Blue sidebar with title */}
        <div
          className="lg:w-1/4 p-6 md:p-8 flex items-center min-h-[150px]"
          style={{ background: 'var(--color-primary)', color: 'white' }}
        >
          <h2 className="text-xl md:text-3xl font-normal leading-tight text-left">
            {slide.title}
          </h2>
        </div>
        {/* Center: Image */}
        <div
          className="lg:w-2/5 p-4 md:p-6 flex items-center justify-center"
          style={{ background: 'var(--color-card)' }}
        >
          <MediaGallery images={imageContent} videos={videoContent} />
        </div>
        {/* Right: SmartArt */}
        <div
          className="lg:w-1/3 p-4 flex items-center justify-center"
          style={{ background: 'var(--color-primary)' }}
        >
          <div className="w-full space-y-3">
            {smartArtContent.map((content, index) => (
              <ContentRenderer key={index} content={content} theme="dark" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row lg:items-stretch">
      {/* Blue sidebar - full height on desktop, minimum height on mobile */}
      <div
        className="lg:w-2/5 p-8 md:p-12 flex items-center min-h-[200px]"
        style={{ background: 'var(--color-primary)', color: 'white' }}
      >
        <h2
          className="text-2xl md:text-4xl font-normal leading-tight text-left"
        >
          {slide.title}
        </h2>
      </div>
      {/* Content area - fills available space */}
      <div
        className="flex-1 p-6 md:p-8 flex items-center justify-center"
        style={{ background: 'var(--color-card)' }}
      >
        {hasMedia ? (
          // Layout with media: gallery centered, text on right if any
          <div className="w-full h-full flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 flex items-center justify-center">
              <MediaGallery images={imageContent} videos={videoContent} />
            </div>
            {hasText && (
              <div className="lg:w-2/5 shrink-0 flex items-center">
                <div className="space-y-4 w-full">
                  {listContent.map((content, index) => (
                    <ContentRenderer key={index} content={content} size="large" />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // No media: render all content centered with large text
          <div className="w-full flex-1 flex flex-col items-center justify-center">
            {contentItems.map((content, index) => (
              <ContentRenderer key={index} content={content} fillSpace size="large" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
