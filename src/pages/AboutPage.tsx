import { Link } from 'react-router-dom';
import { sessionInfo } from '../data/sessionInfo';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-primary)' }}>
        About This Handout
      </h1>

      <div className="space-y-8">
        {/* What is this site */}
        <section className="card p-6">
          <h2 className="text-xl font-semibold mb-3">What is this site?</h2>
          <p className="text-gray-700 mb-4">
            This is an interactive handout website for the presentation{' '}
            <strong>"{sessionInfo.title}"</strong>
            {sessionInfo.speaker?.name && (
              <> by <strong>{sessionInfo.speaker.name}</strong></>
            )}
            . It provides an accessible way to browse the slides, search through content,
            and access related resources.
          </p>
          <p className="text-gray-700">
            Unlike static PDF handouts, this site lets you navigate slides with keyboard shortcuts,
            search across all content including speaker notes, and view media in a dedicated gallery.
          </p>
        </section>

        {/* Features */}
        <section className="card p-6">
          <h2 className="text-xl font-semibold mb-3">Features</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">■</span>
              <span><strong>Slide Browser</strong> - Navigate through all slides with keyboard shortcuts or the sidebar</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">■</span>
              <span><strong>Search</strong> - Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-sm">/</kbd> to search through all slide content and speaker notes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">■</span>
              <span><strong>Media Gallery</strong> - View all images and videos from the presentation in one place</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">■</span>
              <span><strong>Resources</strong> - Quick access to links and references mentioned in the presentation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">■</span>
              <span><strong>Keyboard Navigation</strong> - Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-sm">?</kbd> to see all available shortcuts</span>
            </li>
          </ul>
        </section>

        {/* How it was created */}
        <section className="card p-6">
          <h2 className="text-xl font-semibold mb-3">How was this created?</h2>
          <p className="text-gray-700 mb-4">
            This handout site was generated using the{' '}
            <strong>PPT Handout Websites</strong> skill for Claude Code, created by{' '}
            <a
              href="https://dominiklukes.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Dominik Lukeš
            </a>{' '}
            in collaboration with Claude (Anthropic's AI assistant).
          </p>
          <p className="text-gray-700 mb-4">
            The skill extracts content from PowerPoint presentations and transforms it into
            an accessible, searchable web format while preserving the structure, speaker notes,
            and media from the original slides.
          </p>
          <p className="text-gray-700">
            Built with React, TypeScript, and Tailwind CSS for a modern, responsive experience.
          </p>
        </section>

        {/* Navigation */}
        <div className="flex flex-wrap gap-4 pt-4">
          <Link
            to="/slides"
            className="btn btn-primary"
          >
            Browse Slides
          </Link>
          <Link
            to="/"
            className="btn btn-secondary"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
