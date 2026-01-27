import type { FlatSlide } from '../../data/types';

interface FinalSlideProps {
  slide: FlatSlide;
}

export default function FinalSlide({ slide }: FinalSlideProps) {
  // Extract any URL/contact info from content
  const listContent = slide.content.filter(c => c.type === 'list');
  const contactInfo: string[] = [];

  listContent.forEach(list => {
    if ('items' in list) {
      list.items.forEach(item => {
        if (item.text) {
          contactInfo.push(item.text);
        }
      });
    }
  });

  return (
    <div
      className="h-full flex flex-col items-center justify-center p-10 md:p-16 text-white"
      style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)' }}
    >
      {/* Large thank you title */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-8">
        {slide.title}
      </h1>

      {/* Contact info */}
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
