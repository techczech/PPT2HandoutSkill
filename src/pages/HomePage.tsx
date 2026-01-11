import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { sessionInfo } from '../data/sessionInfo';
import { extractResources } from '../utils/extractResources';
import presentationData from '../data/presentation.json';
import type { Presentation } from '../data/types';

export default function HomePage() {
  const resources = useMemo(() => {
    return extractResources(presentationData as Presentation);
  }, []);

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
          {/* Presenter Website Link */}
          <a
            href={sessionInfo.speaker.links.website}
            target="_blank"
            rel="noopener noreferrer"
            className="card flex items-center gap-4 p-5 no-underline transition-all hover:shadow-lg"
            style={{ borderTop: '4px solid var(--color-accent)' }}
          >
            <div className="w-14 h-14 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--color-accent)', color: 'white' }}>
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="font-semibold text-lg block" style={{ color: 'var(--color-primary)' }}>dominiklukes.net</span>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Presenter website with all links and resources</p>
            </div>
            <svg className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>

          {/* Example Apps */}
          <div>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <svg className="w-5 h-5" style={{ color: 'var(--color-accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Example Apps Built with Vibecoding
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {sessionInfo.exampleApps.map((app) => (
                <a
                  key={app.name}
                  href={app.url}
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
                    <span className="font-medium block" style={{ color: 'var(--color-primary)' }}>{app.name}</span>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{app.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* AI Tools */}
          <div>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <svg className="w-5 h-5" style={{ color: 'var(--color-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              AI Coding Tools
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {resources.tools.map((tool) => (
                <div key={tool.name} className="resource-card">
                  <h3 className="font-medium text-sm" style={{ color: 'var(--color-primary)' }}>{tool.name}</h3>
                  {tool.description && (
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      {tool.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link
                to="/resources"
                className="inline-flex items-center gap-2 text-sm font-medium"
                style={{ color: 'var(--color-accent)' }}
              >
                View all resources & key terms
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Browse Slides CTA */}
          <Link
            to="/slides"
            className="card card-hover flex items-center gap-6 no-underline"
            style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)', color: 'white' }}
          >
            <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-white/20">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">Browse Presentation Slides</h3>
              <p className="opacity-80">86 slides covering AI-assisted coding for language teachers</p>
            </div>
            <svg className="w-6 h-6 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          {/* Collapsible About Section */}
          <details className="card group">
            <summary className="cursor-pointer list-none flex items-center justify-between">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                About This Workshop
              </h2>
              <svg
                className="w-5 h-5 transition-transform group-open:rotate-180"
                style={{ color: 'var(--color-text-muted)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
              <div className="space-y-5" style={{ maxWidth: 'var(--max-content-width)' }}>
                {sessionInfo.abstract.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </details>

          {/* Session Details */}
          <div className="card" style={{ background: 'var(--color-surface)' }}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  Session Details
                </p>
                <p className="font-medium" style={{ color: 'var(--color-text)' }}>
                  {sessionInfo.event.name} • {sessionInfo.event.type}
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {sessionInfo.event.date} • {sessionInfo.event.time} • {sessionInfo.event.location}
                </p>
              </div>
              <div className="flex gap-3">
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
        </div>
      </div>
    </div>
  );
}
