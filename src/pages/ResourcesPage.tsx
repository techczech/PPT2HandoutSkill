import { useMemo } from 'react';
import { extractResources } from '../utils/extractResources';
import presentationData from '../data/presentation.json';
import type { Presentation } from '../data/types';
import { sessionInfo } from '../data/sessionInfo';

export default function ResourcesPage() {
  const resources = useMemo(() => {
    return extractResources(presentationData as Presentation);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section style={{ padding: 'calc(var(--spacing-page-y) * 1.5) var(--spacing-page-x)', background: 'var(--color-primary)', color: 'white' }}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
            Tools & Resources
          </h1>
          <p className="opacity-80">
            Links, tools, and key terms from the workshop
          </p>
        </div>
      </section>

      {/* Quick Links */}
      <section style={{ padding: 'var(--spacing-page-y) var(--spacing-page-x)' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-5">Quick Links</h2>
          <a
            href={sessionInfo.speaker.links.website}
            target="_blank"
            rel="noopener noreferrer"
            className="resource-card flex items-center gap-4 p-4"
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-accent)', color: 'white' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="font-medium block" style={{ color: 'var(--color-primary)' }}>dominiklukes.net</span>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Presenter website with all links and resources</p>
            </div>
            <svg className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </section>

      {/* AI Coding Tools */}
      <section style={{ padding: 'var(--spacing-page-y) var(--spacing-page-x)' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-5">AI Coding Tools</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {resources.tools.map((tool) => (
              <div key={tool.name} className="resource-card">
                <h3 className="font-medium" style={{ color: 'var(--color-primary)' }}>{tool.name}</h3>
                {tool.description && (
                  <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    {tool.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Terms */}
      <section style={{ padding: 'var(--spacing-page-y) var(--spacing-page-x)' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-5">Key Terms & Concepts</h2>
          <div className="card">
            <dl className="space-y-4">
              {resources.terms.map((item) => (
                <div key={item.term} className="pb-4 border-b last:border-0 last:pb-0" style={{ borderColor: 'var(--color-border)' }}>
                  <dt className="font-semibold" style={{ color: 'var(--color-primary)' }}>{item.term}</dt>
                  {item.context && (
                    <dd className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      {item.context}
                    </dd>
                  )}
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Links from Slides */}
      {resources.links.length > 0 && (
        <section style={{ padding: 'var(--spacing-page-y) var(--spacing-page-x)' }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-5">Links Mentioned</h2>
            <div className="card">
              <ul className="space-y-3">
                {resources.links.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:underline"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
