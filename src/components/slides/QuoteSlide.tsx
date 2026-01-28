import type { FlatSlide, HeadingContent, ImageContent, ListContent, ListItem, TextRun } from '../../data/types';

interface QuoteSlideProps {
  slide: FlatSlide;
}

// Render text with bold formatting from runs
function renderRuns(runs: TextRun[]) {
  return runs.map((run: TextRun, i: number) => (
    run.bold ? <strong key={i} className="font-bold">{run.text}</strong> : <span key={i}>{run.text}</span>
  ));
}

function renderQuoteText(item: ListItem) {
  if (item.runs && item.runs.length > 0) {
    return renderRuns(item.runs);
  }
  return item.text;
}

export default function QuoteSlide({ slide }: QuoteSlideProps) {
  // Extract quote text from heading or list content
  const headingContent = slide.content.find(c => c.type === 'heading') as HeadingContent | undefined;
  const listContent = slide.content.find(c => c.type === 'list') as ListContent | undefined;
  const imageContent = slide.content.find(c => c.type === 'image') as ImageContent | undefined;

  const quoteItem = listContent?.items?.[0];
  const attribution = slide.title;

  // Determine quote text with runs
  let quoteElement: React.ReactNode | null = null;
  if (headingContent) {
    if (headingContent.runs && headingContent.runs.length > 0) {
      quoteElement = renderRuns(headingContent.runs);
    } else {
      quoteElement = headingContent.text;
    }
  } else if (quoteItem) {
    quoteElement = renderQuoteText(quoteItem);
  }

  const hasText = !!quoteElement;
  const hasImage = !!imageContent;

  // Image-only quote (no text, just an image like a screenshot of a tweet)
  if (!hasText && hasImage) {
    return (
      <div className="h-full flex flex-col" style={{ background: 'var(--color-card)' }}>
        <div className="flex-1 flex items-center p-6 md:p-10 lg:p-12">
          {/* Quote mark */}
          <div className="hidden md:flex items-start justify-center w-[15%] shrink-0 pt-2">
            <svg
              viewBox="0 0 100 100"
              className="w-20 h-20 lg:w-28 lg:h-28"
              style={{ fill: 'var(--color-primary)' }}
            >
              <path d="M20 65c0-11 9-20 20-20 2.2 0 4 1.8 4 4 0 2.2-1.8 4-4 4-6.6 0-12 5.4-12 12v1h12c4.4 0 8 3.6 8 8v6c0 4.4-3.6 8-8 8H28c-4.4 0-8-3.6-8-8V65zm40 0c0-11 9-20 20-20 2.2 0 4 1.8 4 4 0 2.2-1.8 4-4 4-6.6 0-12 5.4-12 12v1h12c4.4 0 8 3.6 8 8v6c0 4.4-3.6 8-8 8H68c-4.4 0-8-3.6-8-8V65z" />
            </svg>
          </div>

          {/* Image fills the quote area */}
          <div className="flex-1 flex items-center justify-center">
            <img
              src={imageContent.src}
              alt={imageContent.alt || ''}
              className="max-h-[60vh] max-w-full rounded-lg object-contain shadow-lg"
            />
          </div>
        </div>

        {/* Attribution bar */}
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

  // Text + image: image on the left, text on the right (matching PPTX layout)
  if (hasText && hasImage) {
    return (
      <div className="h-full flex flex-col" style={{ background: 'var(--color-card)' }}>
        <div className="flex-1 flex items-center p-6 md:p-10 lg:p-12">
          {/* Quote mark top-left */}
          <div className="hidden md:flex items-start justify-center w-[10%] shrink-0 self-start pt-2">
            <svg
              viewBox="0 0 100 100"
              className="w-16 h-16 lg:w-24 lg:h-24"
              style={{ fill: 'var(--color-primary)' }}
            >
              <path d="M20 65c0-11 9-20 20-20 2.2 0 4 1.8 4 4 0 2.2-1.8 4-4 4-6.6 0-12 5.4-12 12v1h12c4.4 0 8 3.6 8 8v6c0 4.4-3.6 8-8 8H28c-4.4 0-8-3.6-8-8V65zm40 0c0-11 9-20 20-20 2.2 0 4 1.8 4 4 0 2.2-1.8 4-4 4-6.6 0-12 5.4-12 12v1h12c4.4 0 8 3.6 8 8v6c0 4.4-3.6 8-8 8H68c-4.4 0-8-3.6-8-8V65z" />
            </svg>
          </div>

          {/* Image on left */}
          <div className="w-2/5 shrink-0 flex items-center justify-center pr-6">
            <img
              src={imageContent!.src}
              alt={imageContent!.alt || ''}
              className="max-h-[50vh] max-w-full rounded-lg object-contain shadow-lg"
            />
          </div>

          {/* Quote text on right */}
          <div className="flex-1 flex items-center">
            <blockquote
              className="text-xl md:text-2xl lg:text-3xl xl:text-4xl leading-relaxed md:leading-relaxed lg:leading-relaxed font-normal"
              style={{ color: 'var(--color-primary)' }}
            >
              {quoteElement}
            </blockquote>
          </div>
        </div>

        {/* Attribution bar */}
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

  // Text-only quote (most common)
  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-card)' }}>
      <div className="flex-1 flex items-center p-6 md:p-10 lg:p-12">
        {/* Large quote mark */}
        <div className="hidden md:flex items-start justify-center w-[20%] shrink-0 pt-2">
          <svg
            viewBox="0 0 100 100"
            className="w-20 h-20 lg:w-28 lg:h-28"
            style={{ fill: 'var(--color-primary)' }}
          >
            <path d="M20 65c0-11 9-20 20-20 2.2 0 4 1.8 4 4 0 2.2-1.8 4-4 4-6.6 0-12 5.4-12 12v1h12c4.4 0 8 3.6 8 8v6c0 4.4-3.6 8-8 8H28c-4.4 0-8-3.6-8-8V65zm40 0c0-11 9-20 20-20 2.2 0 4 1.8 4 4 0 2.2-1.8 4-4 4-6.6 0-12 5.4-12 12v1h12c4.4 0 8 3.6 8 8v6c0 4.4-3.6 8-8 8H68c-4.4 0-8-3.6-8-8V65z" />
          </svg>
        </div>

        <div className="flex-1 flex items-center">
          <blockquote
            className="text-xl md:text-2xl lg:text-3xl xl:text-4xl leading-relaxed md:leading-relaxed lg:leading-relaxed font-normal"
            style={{ color: 'var(--color-primary)' }}
          >
            {quoteElement || slide.title}
          </blockquote>
        </div>
      </div>

      {/* Attribution bar */}
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
