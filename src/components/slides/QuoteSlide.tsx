import type { FlatSlide, ListContent, ListItem, TextRun } from '../../data/types';

interface QuoteSlideProps {
  slide: FlatSlide;
}

// Render text with bold formatting from runs
function renderQuoteText(item: ListItem) {
  if (item.runs && item.runs.length > 0) {
    return item.runs.map((run: TextRun, i: number) => (
      run.bold ? <strong key={i} className="font-bold">{run.text}</strong> : <span key={i}>{run.text}</span>
    ));
  }
  return item.text;
}

export default function QuoteSlide({ slide }: QuoteSlideProps) {
  // Extract quote text from list content
  const listContent = slide.content.find(c => c.type === 'list') as ListContent | undefined;
  const quoteItem = listContent?.items?.[0];
  const attribution = slide.title;

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-card)' }}>
      {/* Main content area with quote */}
      <div className="flex-1 flex items-center p-6 md:p-10 lg:p-12">
        {/* Large quote mark - takes ~20% width */}
        <div className="hidden md:flex items-start justify-center w-[20%] shrink-0 pt-2">
          <svg
            viewBox="0 0 100 100"
            className="w-20 h-20 lg:w-28 lg:h-28"
            style={{ fill: 'var(--color-primary)' }}
          >
            <path d="M20 65c0-11 9-20 20-20 2.2 0 4 1.8 4 4 0 2.2-1.8 4-4 4-6.6 0-12 5.4-12 12v1h12c4.4 0 8 3.6 8 8v6c0 4.4-3.6 8-8 8H28c-4.4 0-8-3.6-8-8V65zm40 0c0-11 9-20 20-20 2.2 0 4 1.8 4 4 0 2.2-1.8 4-4 4-6.6 0-12 5.4-12 12v1h12c4.4 0 8 3.6 8 8v6c0 4.4-3.6 8-8 8H68c-4.4 0-8-3.6-8-8V65z" />
          </svg>
        </div>

        {/* Quote text - takes remaining ~80% */}
        <div className="flex-1 flex items-center">
          <blockquote
            className="text-xl md:text-2xl lg:text-3xl xl:text-4xl leading-relaxed md:leading-relaxed lg:leading-relaxed font-normal"
            style={{ color: 'var(--color-primary)' }}
          >
            {quoteItem ? renderQuoteText(quoteItem) : slide.title}
          </blockquote>
        </div>
      </div>

      {/* Attribution bar at bottom */}
      {attribution && (
        <div
          className="shrink-0 py-4 px-6 md:px-10 lg:px-12 text-center"
          style={{ background: 'var(--color-primary)' }}
        >
          <p className="text-white text-base md:text-lg lg:text-xl font-normal">
            {attribution}
          </p>
        </div>
      )}
    </div>
  );
}
