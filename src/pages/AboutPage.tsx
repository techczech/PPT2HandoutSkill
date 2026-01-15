import { Link } from 'react-router-dom';
import { sessionInfo } from '../data/sessionInfo';
import presentationData from '../data/presentation.json';
import type { Presentation } from '../data/types';

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

const presentation = presentationData as Presentation;
const SKILL_REPO_URL = 'https://github.com/techczech/PPT2HandoutSkill';

export default function AboutPage() {
  // Count images with AI-generated descriptions
  const imagesWithDescriptions = presentation.sections.reduce((count, section) => {
    return count + section.slides.reduce((slideCount, slide) => {
      return slideCount + slide.content.filter(
        block => block.type === 'image' && (block as any).description
      ).length;
    }, 0);
  }, 0);

  // Count images with categories
  const imagesWithCategories = presentation.sections.reduce((count, section) => {
    return count + section.slides.reduce((slideCount, slide) => {
      return slideCount + slide.content.filter(
        block => block.type === 'image' && (block as any).category
      ).length;
    }, 0);
  }, 0);

  // Get unique categories
  const allCategories = new Set<string>();
  presentation.sections.forEach(section => {
    section.slides.forEach(slide => {
      slide.content.forEach(block => {
        if (block.type === 'image' && (block as any).category) {
          allCategories.add((block as any).category);
        }
      });
    });
  });

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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
                {presentation.metadata?.stats?.slide_count || 0}
              </div>
              <div className="text-sm text-gray-600">Slides</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
                {presentation.metadata?.stats?.image_count || 0}
              </div>
              <div className="text-sm text-gray-600">Images</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-3xl font-bold" style={{ color: 'var(--color-accent)' }}>
                ✓
              </div>
              <div className="text-sm text-gray-600">Searchable</div>
            </div>
          </div>
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
            <strong>PPT2HandoutSkill</strong> for Claude Code, created by{' '}
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
            and media from the original slides. AI-powered entity extraction identifies people,
            quotes, tools, and key terms mentioned throughout the presentation.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              🔄 Replicate This Process
            </h3>
            <p className="text-blue-800 text-sm mb-3">
              You can create your own interactive handout sites from PowerPoint presentations!
              The skill and templates are open source and available on GitHub.
            </p>
            <a
              href={SKILL_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              View PPT2HandoutSkill on GitHub
            </a>
          </div>

          <p className="text-gray-700 text-sm">
            Built with React, TypeScript, and Tailwind CSS. Deployed on Cloudflare Pages.
          </p>
        </section>

        {/* AI Processing Stats */}
        {imagesWithDescriptions > 0 && (
          <section className="card p-6">
            <h2 className="text-xl font-semibold mb-3">AI Image Analysis</h2>
            <p className="text-gray-700 mb-4">
              Images in this presentation were analyzed using{' '}
              {processingStats?.model || 'Gemini 3 Flash Preview'}
              {processingStats?.processedAt && (
                <> on {new Date(processingStats.processedAt).toLocaleDateString()}</>
              )}
              {' '}to generate descriptions and categorize content.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-primary">{imagesWithDescriptions}</div>
                <div className="text-gray-600">Images with descriptions</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-primary">{imagesWithCategories}</div>
                <div className="text-gray-600">Images categorized</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {allCategories.size}
                </div>
                <div className="text-gray-600">Categories used</div>
              </div>
            </div>
            {allCategories.size > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Categories detected:</p>
                <div className="flex flex-wrap gap-2">
                  {Array.from(allCategories).sort().map((category) => {
                    const count = presentation.sections.reduce((total, section) => {
                      return total + section.slides.reduce((slideTotal, slide) => {
                        return slideTotal + slide.content.filter(
                          block => block.type === 'image' && (block as any).category === category
                        ).length;
                      }, 0);
                    }, 0);
                    return (
                      <span
                        key={category}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                      >
                        {category}: {count}
                      </span>
                    );
                  })}
                </div>
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
