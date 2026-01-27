import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { sessionInfo } from '../data/sessionInfo';
import { extractResources } from '../utils/extractResources';
import presentationData from '../data/presentation.json';
import type { Presentation } from '../data/types';

export default function HomePage() {
  const presentation = presentationData as Presentation;
  const resources = useMemo(() => {
    return extractResources(presentation);
  }, []);

  const slideCount = presentation.metadata?.stats?.slide_count ||
    presentation.sections?.reduce((acc, s) => acc + (s.slides?.length || 0), 0) || 0;

  // Check what optional content is available
  const hasKeyTopics = sessionInfo.keyTopics && sessionInfo.keyTopics.length > 0;
  const hasFeaturedLinks = sessionInfo.featuredLinks?.items && sessionInfo.featuredLinks.items.length > 0;
  const hasEventName = sessionInfo.event?.name && sessionInfo.event.name.trim() !== '';
  const hasSessionLink = sessionInfo.event?.sessionLink && sessionInfo.event.sessionLink.trim() !== '';
  const hasTalkPage = sessionInfo.talkPageUrl && sessionInfo.talkPageUrl.trim() !== '';
  const hasResources = resources.tools && resources.tools.length > 0;

  // Build session details string dynamically
  const sessionDetails = [
    sessionInfo.event?.date,
    sessionInfo.event?.time,
    sessionInfo.event?.location,
  ].filter(Boolean).join(' • ');

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface)' }}>
      <div className="page-container">
        {/* Hero Section */}
        <section className="hero">
          <div className="max-w-2xl">
            <h1 className="text-2xl md:text-3xl mb-3">{sessionInfo.title}</h1>
            <p className="text-lg opacity-90 mb-5">{sessionInfo.subtitle}</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                {sessionInfo.speaker.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-medium">{sessionInfo.speaker.name}</p>
                <p className="text-sm opacity-80">{sessionInfo.speaker.affiliation}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <div className="page-content">
          {/* Primary CTAs - Slides and Talk Page side by side */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Browse Slides - Always shown prominently */}
            <Link
              to="/slides"
              className="card card-hover flex items-center gap-4 p-5 no-underline"
              style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)', color: 'white' }}
            >
              <div className="w-14 h-14 rounded-lg flex items-center justify-center shrink-0 bg-white/20">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="font-semibold text-lg block">Browse Slides</span>
                <p className="text-sm opacity-80">{slideCount} slides with full content</p>
              </div>
              <svg className="w-5 h-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {/* Talk Page Link (if available) */}
            {hasTalkPage && (
              <a
                href={sessionInfo.talkPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="card card-hover flex items-center gap-4 p-5 no-underline"
                style={{ borderTop: '4px solid var(--color-accent)' }}
              >
                <div className="w-14 h-14 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--color-accent)', color: 'white' }}>
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-lg block" style={{ color: 'var(--color-primary)' }}>{sessionInfo.talkPageLabel || 'Talk Page'}</span>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>More about this presentation</p>
                </div>
                <svg className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}

            {/* Presenter Website Link (if no talk page) */}
            {!hasTalkPage && sessionInfo.speaker.links.website && (
              <a
                href={sessionInfo.speaker.links.website}
                target="_blank"
                rel="noopener noreferrer"
                className="card card-hover flex items-center gap-4 p-5 no-underline"
                style={{ borderTop: '4px solid var(--color-accent)' }}
              >
                <div className="w-14 h-14 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--color-accent)', color: 'white' }}>
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-lg block" style={{ color: 'var(--color-primary)' }}>
                    {new URL(sessionInfo.speaker.links.website).hostname.replace('www.', '')}
                  </span>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Presenter website</p>
                </div>
                <svg className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>

          {/* Abstract - Prominent placement */}
          {sessionInfo.abstract && (
            <div className="card" style={{ borderLeft: '4px solid var(--color-accent)' }}>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
                <svg className="w-5 h-5" style={{ color: 'var(--color-accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                About This {sessionInfo.event?.type || 'Presentation'}
              </h2>
              <div className="space-y-4" style={{ maxWidth: 'var(--max-content-width)' }}>
                {sessionInfo.abstract.split('\n\n').map((paragraph, index) => (
                  <p key={index} style={{ color: 'var(--color-text)', lineHeight: '1.7' }}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Key Topics - Prominent placement */}
          {hasKeyTopics && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
                <svg className="w-5 h-5" style={{ color: 'var(--color-accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Topics Covered
              </h2>
              <ul className="bullet-list space-y-3">
                {sessionInfo.keyTopics.map((topic, index) => (
                  <li key={index} className="bullet-item" style={{ color: 'var(--color-text)', fontSize: '1.05rem' }}>
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Featured Links (if available) */}
          {hasFeaturedLinks && (
            <div>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <svg className="w-5 h-5" style={{ color: 'var(--color-accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                {sessionInfo.featuredLinks.title || 'Related Resources'}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {sessionInfo.featuredLinks.items.map((item) => (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resource-card flex items-center gap-4 p-4"
                  >
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, var(--color-surface) 0%, #fff 100%)', border: '2px solid var(--color-border)' }}>
                      <svg className="w-6 h-6" style={{ color: 'var(--color-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-medium block" style={{ color: 'var(--color-primary)' }}>{item.name}</span>
                      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{item.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Index Preview - Show examples from extracted resources */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
                <svg className="w-5 h-5" style={{ color: 'var(--color-accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Index & Glossary Preview
              </h2>
              <Link
                to="/resources"
                className="text-sm font-medium inline-flex items-center gap-1"
                style={{ color: 'var(--color-accent)' }}
              >
                View Full Index
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* People */}
              {resources.people && resources.people.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>
                    People Mentioned ({resources.people.length})
                  </h3>
                  <div className="space-y-2">
                    {resources.people.slice(0, 3).map((person, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold" style={{ background: 'var(--color-primary)', color: 'white' }}>
                          {person.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>{person.name}</p>
                          {person.role && (
                            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{person.role}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quotes */}
              {resources.quotes && resources.quotes.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>
                    Key Quotes ({resources.quotes.length})
                  </h3>
                  <div className="space-y-3">
                    {resources.quotes.slice(0, 2).map((quote, index) => (
                      <div key={index} className="pl-3" style={{ borderLeft: '3px solid var(--color-accent)' }}>
                        <p className="text-sm italic" style={{ color: 'var(--color-text)' }}>"{quote.text.slice(0, 100)}{quote.text.length > 100 ? '...' : ''}"</p>
                        {quote.attribution && (
                          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>— {quote.attribution}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tools & Technologies */}
              {hasResources && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>
                    Tools & Technologies ({resources.tools.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {resources.tools.slice(0, 6).map((tool, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ background: 'var(--color-surface)', color: 'var(--color-primary)', border: '1px solid var(--color-border)' }}
                      >
                        {tool.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Terms */}
              {resources.terms && resources.terms.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>
                    Key Terms ({resources.terms.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {resources.terms.slice(0, 6).map((term, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ background: 'var(--color-accent)', color: 'white' }}
                      >
                        {term.term}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates */}
              {resources.dates && resources.dates.length > 0 && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>
                    Important Dates ({resources.dates.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {resources.dates.slice(0, 3).map((date, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--color-primary)', color: 'white' }}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>{date.formatted}</p>
                          {date.context && (
                            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{date.context.slice(0, 40)}{date.context.length > 40 ? '...' : ''}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Session Details (only show if there's meaningful event info) */}
          {(hasEventName || sessionDetails) && (
            <div className="card" style={{ background: 'var(--color-surface)' }}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
                    Session Details
                  </p>
                  {hasEventName && (
                    <p className="font-medium" style={{ color: 'var(--color-text)' }}>
                      {sessionInfo.event.name}{sessionInfo.event?.type ? ` • ${sessionInfo.event.type}` : ''}
                    </p>
                  )}
                  {sessionDetails && (
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      {sessionDetails}
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  {hasSessionLink && (
                    <a
                      href={sessionInfo.event.sessionLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{ background: 'var(--color-card)', color: 'var(--color-primary)', border: '1px solid var(--color-border)' }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Conference Page
                    </a>
                  )}
                  <a
                    href={`mailto:${sessionInfo.speaker.email}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{ background: 'var(--color-card)', color: 'var(--color-primary)', border: '1px solid var(--color-border)' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
