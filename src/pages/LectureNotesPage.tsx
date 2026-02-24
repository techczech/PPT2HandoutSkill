import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sessionInfo } from '../data/sessionInfo';

// Import lecture notes data
import { lectureNotes } from '../data/lectureNotes';

/**
 * Convert a section title to a URL-safe anchor ID.
 */
function toAnchorId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Parse the slide range string (e.g., "23-46") and return the first slide number.
 */
function firstSlideFromRange(slideRange: string): number | null {
  const match = slideRange.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Render narrative text as HTML with basic markdown support.
 * Handles: **bold**, *italic*, [text](url), and internal /slides/N links.
 * Paragraphs are separated by double newlines.
 */
function applyInlineFormatting(text: string): string {
  let html = text;

  // Escape HTML entities (basic safety)
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Inline code: `text`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold: **text**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic: *text* (but not inside already-processed bold tags)
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

  // Markdown links: [text](url)
  // Internal links need #/ prefix for HashRouter
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, text, url) => {
    if (url.startsWith('/slides/')) {
      return `<a href="#${url}" data-slide-link="true" class="slide-link">${text}</a>`;
    }
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
  });

  return html;
}

function renderNarrative(narrative: string): string {
  const blocks = narrative.split(/\n\n+/).filter(p => p.trim());
  const output: string[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim();

    // Heading: ### text
    if (block.startsWith('### ')) {
      const text = applyInlineFormatting(block.slice(4));
      output.push(`<h3>${text}</h3>`);
      continue;
    }

    // Bullet list: lines starting with -
    if (block.split('\n').every(line => line.trim().startsWith('- '))) {
      const items = block.split('\n').map(line => {
        const text = applyInlineFormatting(line.trim().slice(2));
        return `<li>${text}</li>`;
      });
      output.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    // Regular paragraph
    let html = applyInlineFormatting(block);
    html = html.replace(/\n/g, '<br>');
    output.push(`<p>${html}</p>`);
  }

  return output.join('');
}

export default function LectureNotesPage() {
  const navigate = useNavigate();
  const sessionType = sessionInfo.event?.type || 'presentation';

  // Pre-render all narratives
  const sectionsWithHtml = useMemo(() => {
    return lectureNotes.map(section => ({
      ...section,
      anchorId: toAnchorId(section.sectionTitle),
      narrativeHtml: renderNarrative(section.narrative),
      firstSlide: firstSlideFromRange(section.slideRange),
    }));
  }, []);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="hero">
        <div className="flex items-center gap-4 mb-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Link>
        </div>
        <h1 className="font-serif">Lecture Notes</h1>
        <p className="mt-2 text-white/80">
          Narrative summary of the {sessionType.toLowerCase()} by section
        </p>
      </div>

      {/* Content */}
      <div className="page-content">
        {/* Table of Contents */}
        <nav className="card" style={{ borderLeft: '4px solid var(--color-accent)' }}>
          <h2
            className="text-lg font-semibold mb-4 flex items-center gap-2"
            style={{ color: 'var(--color-primary)' }}
          >
            <svg className="w-5 h-5" style={{ color: 'var(--color-accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Contents
          </h2>
          <ol className="space-y-2">
            {sectionsWithHtml.map((section, index) => (
              <li key={section.anchorId}>
                <a
                  href={`#/lecture-notes`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(section.anchorId)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-3 py-1.5 px-2 rounded-lg transition-colors hover:bg-gray-50 group"
                  style={{ color: 'var(--color-text)' }}
                >
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: 'var(--color-primary)', color: 'white' }}
                  >
                    {index + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium group-hover:underline">
                    {section.sectionTitle}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)' }}
                  >
                    Slides {section.slideRange}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Sections */}
        {sectionsWithHtml.map((section, index) => (
          <section
            key={section.anchorId}
            id={section.anchorId}
            className="card"
            style={{ scrollMarginTop: 'calc(var(--nav-height) + 1rem)' }}
          >
            {/* Section heading */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: 'var(--color-primary)', color: 'white' }}
                >
                  {index + 1}
                </span>
                <h2
                  className="text-xl font-semibold"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {section.sectionTitle}
                </h2>
              </div>
              {section.firstSlide !== null && (
                <Link
                  to={`/slides/${section.firstSlide}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0"
                  style={{
                    background: 'var(--color-surface)',
                    color: 'var(--color-primary)',
                    border: '1px solid var(--color-border)',
                  }}
                  title={`Go to slide ${section.firstSlide}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Slides {section.slideRange}
                </Link>
              )}
            </div>

            {/* Narrative content */}
            <div
              className="lecture-narrative"
              style={{ maxWidth: 'var(--max-content-width)' }}
              dangerouslySetInnerHTML={{ __html: section.narrativeHtml }}
              onClick={(e) => {
                // Intercept clicks on internal slide links for SPA navigation
                const target = e.target as HTMLElement;
                const anchor = target.closest('a[data-slide-link]') as HTMLAnchorElement | null;
                if (anchor) {
                  e.preventDefault();
                  const href = anchor.getAttribute('href');
                  if (href) {
                    // Strip leading # for HashRouter navigate()
                    navigate(href.replace(/^#/, ''));
                  }
                }
              }}
            />
          </section>
        ))}

        {/* Bottom navigation */}
        <div className="flex flex-wrap gap-4 pt-2">
          <Link
            to="/slides"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: 'var(--color-primary)',
              color: 'white',
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Browse Slides
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: 'var(--color-card)',
              color: 'var(--color-primary)',
              border: '1px solid var(--color-border)',
            }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
