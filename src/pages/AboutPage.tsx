import { Link } from 'react-router-dom';
import { sessionInfo } from '../data/sessionInfo';

// Processing stats type
interface ProcessingStats {
  processedAt?: string;
  model?: string;
  imagesProcessed?: number;
  imagesSkipped?: number;
  tokensUsed?: { input: number; output: number; total: number };
  categoryCounts?: Record<string, number>;
  durationSeconds?: number;
}

// Processing stats will be imported if the file exists
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const statsModules = import.meta.glob('../data/processingStats.json', { eager: true });
const processingStats: ProcessingStats | null = Object.values(statsModules)[0] as ProcessingStats | null;

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

        {/* AI Processing Stats (if available) */}
        {processingStats && processingStats.imagesProcessed && (
          <section className="card p-6">
            <h2 className="text-xl font-semibold mb-3">AI Image Analysis</h2>
            <p className="text-gray-700 mb-4">
              Images in this presentation were analyzed using {processingStats.model || 'Gemini AI'}
              {processingStats.processedAt && (
                <> on {new Date(processingStats.processedAt).toLocaleDateString()}</>
              )}.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-primary">{processingStats.imagesProcessed}</div>
                <div className="text-gray-600">Images analyzed</div>
              </div>
              {processingStats.tokensUsed && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {(processingStats.tokensUsed.total / 1000).toFixed(1)}K
                  </div>
                  <div className="text-gray-600">Tokens used</div>
                </div>
              )}
              {processingStats.categoryCounts && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {Object.keys(processingStats.categoryCounts).length}
                  </div>
                  <div className="text-gray-600">Categories detected</div>
                </div>
              )}
            </div>
            {processingStats.categoryCounts && Object.keys(processingStats.categoryCounts).length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {Object.entries(processingStats.categoryCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, count]) => (
                    <span
                      key={category}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                    >
                      {category}: {count}
                    </span>
                  ))}
              </div>
            )}
          </section>
        )}

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
