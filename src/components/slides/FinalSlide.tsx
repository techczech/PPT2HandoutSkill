import type { FlatSlide } from '../../data/types';

interface FinalSlideProps {
  slide: FlatSlide;
}

export default function FinalSlide({ slide }: FinalSlideProps) {
  // Extract any URL/contact info from all content (lists and headings)
  const contactInfo: string[] = [];

  slide.content.forEach(c => {
    if ('items' in c) {
      (c as { items: { text?: string }[] }).items.forEach(item => {
        if (item.text) contactInfo.push(item.text);
      });
    } else if ('text' in c && (c as { type: string }).type === 'heading') {
      contactInfo.push((c as { text: string }).text);
    }
  });

  const hasBgImage = !!slide.layout_background;

  // With layout background image: same style as title slide
  if (hasBgImage) {
    return (
      <div className="h-full flex flex-col relative overflow-hidden">
        {/* Background image */}
        <img
          src={slide.layout_background}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Content overlay */}
        <div className="relative flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-end p-8 md:p-12 lg:p-16">
            {/* Title box on right side */}
            <div
              className="px-8 py-10 md:px-12 md:py-14 max-w-[60%]"
              style={{ background: 'var(--color-primary)' }}
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-white">
                {slide.title}
              </h1>
            </div>
          </div>
          {/* Contact info bar */}
          {contactInfo.length > 0 && (
            <div
              className="py-3 text-center text-lg md:text-xl text-white"
              style={{ background: 'var(--color-primary)' }}
            >
              {contactInfo.map((info, index) => (
                <span key={index} className="mx-2">
                  {info.includes('.') && !info.includes('@') ? (
                    <a
                      href={`https://${info}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {info}
                    </a>
                  ) : info.includes('@') ? (
                    <a href={`mailto:${info}`} className="hover:underline">
                      {info}
                    </a>
                  ) : (
                    info
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fallback: gradient background
  return (
    <div
      className="h-full flex flex-col items-center justify-center p-10 md:p-16 text-white"
      style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)' }}
    >
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-8">
        {slide.title}
      </h1>

      {contactInfo.length > 0 && (
        <div className="text-xl md:text-2xl text-white/80 text-center space-y-2">
          {contactInfo.map((info, index) => (
            <p key={index}>
              {info.includes('.') && !info.includes('@') ? (
                <a
                  href={`https://${info}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline"
                >
                  {info}
                </a>
              ) : info.includes('@') ? (
                <a
                  href={`mailto:${info}`}
                  className="hover:text-white underline"
                >
                  {info}
                </a>
              ) : (
                info
              )}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
