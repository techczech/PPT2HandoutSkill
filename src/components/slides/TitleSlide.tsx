import type { FlatSlide, ImageContent, VideoContent } from '../../data/types';
import ContentRenderer from '../content/ContentRenderer';
import MediaGallery from '../content/MediaGallery';

interface TitleSlideProps {
  slide: FlatSlide;
}

// Render title with bold prefix (text before first colon or question mark)
function FormattedTitle({ text, className, style }: { text: string; className?: string; style?: React.CSSProperties }) {
  // Find natural break point - colon followed by space, or split on question marks
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

export default function TitleSlide({ slide }: TitleSlideProps) {
  const contentItems = slide.content.filter(c => c.type !== 'heading');

  // Separate media from other content
  const imageContent = contentItems.filter(c => c.type === 'image') as ImageContent[];
  const videoContent = contentItems.filter(c => c.type === 'video') as VideoContent[];
  const smartArtContent = contentItems.filter(c => c.type === 'smart_art');
  const listContent = contentItems.filter(c => c.type === 'list');
  const otherContent = contentItems.filter(c => {
    const type = (c as { type: string }).type;
    return type !== 'image' && type !== 'video' && type !== 'shape';
  });
  const hasMedia = imageContent.length > 0 || videoContent.length > 0;
  const hasSmartArt = smartArtContent.length > 0;
  const hasOtherContent = otherContent.length > 0;

  // Check if this is a "statement slide" - title only, no meaningful content
  const isStatementSlide = !hasMedia && !hasOtherContent;

  // Check if this is the intro/first slide (Title Slide with image background)
  const isIntroSlide = slide.layout.toLowerCase().includes('title slide') && slide.order === 1;

  // Intro slide: QR code on left, title box on right, contact info at bottom
  if (isIntroSlide && hasMedia) {
    // Extract contact info from lists - separate URL from email
    const urlInfo: string[] = [];
    const emailInfo: string[] = [];
    listContent.forEach(list => {
      if ('items' in list) {
        list.items.forEach((item: { text?: string }) => {
          if (item.text) {
            if (item.text.includes('@')) {
              emailInfo.push(item.text);
            } else if (item.text.includes('.')) {
              urlInfo.push(item.text);
            }
          }
        });
      }
    });

    return (
      <div
        className="h-full flex flex-col relative"
        style={{ background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)' }}
      >
        {/* Main content area */}
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8 p-8 md:p-12">
          {/* Left side: QR code */}
          <div className="md:w-2/5 flex flex-col items-center">
            <div className="w-48 md:w-64 lg:w-72">
              <MediaGallery images={imageContent} videos={videoContent} />
            </div>
            {/* URL below QR code */}
            {urlInfo.length > 0 && (
              <div className="mt-4 text-xl md:text-2xl font-medium" style={{ color: 'var(--color-primary)' }}>
                {urlInfo.map((url, index) => (
                  <a key={index} href={`https://${url}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {url}
                  </a>
                ))}
              </div>
            )}
          </div>
          {/* Right side: Title in dark blue box */}
          <div
            className="md:w-1/2 px-8 py-10 md:px-12 md:py-14"
            style={{ background: 'var(--color-primary)' }}
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-white text-center">
              {slide.title}
            </h1>
          </div>
        </div>
        {/* Bottom strip: Email */}
        {emailInfo.length > 0 && (
          <div
            className="py-3 text-center text-lg md:text-xl text-white"
            style={{ background: 'var(--color-primary)' }}
          >
            {emailInfo.map((email, index) => (
              <a key={index} href={`mailto:${email}`} className="hover:underline">
                {email}
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Slide with media: title at top, media centered, text on right if any
  if (hasMedia) {
    return (
      <div
        className="h-full flex flex-col p-6 md:p-8"
        style={{ background: 'var(--color-card)' }}
      >
        <h1
          className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 shrink-0"
          style={{ color: 'var(--color-primary)' }}
        >
          {slide.title}
        </h1>
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 overflow-hidden">
          {/* Media gallery - centered */}
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <MediaGallery images={imageContent} videos={videoContent} />
          </div>
          {/* Text content on right if any - vertically centered */}
          {hasOtherContent && (
            <div className="lg:w-2/5 shrink-0 flex items-center">
              <div className="space-y-4 w-full">
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

  // Statement slide: title-only, render as left-aligned text on light background
  if (isStatementSlide) {
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

  // SmartArt only (no media): blue title strip at top, SmartArt centered below
  if (hasSmartArt && !hasMedia) {
    return (
      <div className="h-full flex flex-col" style={{ background: 'var(--color-card)' }}>
        {/* Blue title strip */}
        <div
          className="px-6 md:px-10 py-4 md:py-6 shrink-0"
          style={{ background: 'var(--color-primary)' }}
        >
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white text-center">
            {slide.title}
          </h1>
        </div>
        {/* SmartArt content - centered */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-10 min-h-0 overflow-auto">
          <div className="w-full max-w-5xl">
            {smartArtContent.map((content, index) => (
              <ContentRenderer key={index} content={content} />
            ))}
            {/* Also render any list content below SmartArt if present */}
            {listContent.length > 0 && (
              <div className="mt-6 space-y-4">
                {listContent.map((content, index) => (
                  <ContentRenderer key={`list-${index}`} content={content} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Has other content but no media: centered gradient style
  return (
    <div
      className="h-full flex flex-col items-center justify-center p-10 md:p-16 text-white"
      style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)' }}
    >
      <h1
        className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 leading-tight"
        style={{ maxWidth: '20ch' }}
      >
        {slide.title}
      </h1>
      <div className="max-w-2xl w-full space-y-5 text-center">
        {contentItems.map((content, index) => (
          <ContentRenderer key={index} content={content} theme="dark" />
        ))}
      </div>
    </div>
  );
}
