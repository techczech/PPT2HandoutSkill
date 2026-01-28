import { useState, useEffect, useRef } from 'react';
import presentationData from '../data/presentation.json';
import type { Section, Slide } from '../data/types';
import { getScreenshotPath } from '../utils/screenshotMapping';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PrintMode = 'rendered' | 'screenshot';

interface FlatSlide extends Slide {
  sectionTitle: string;
  sectionIndex: number;
  globalIndex: number;
}

function flattenSlides(sections: Section[]): FlatSlide[] {
  const flat: FlatSlide[] = [];
  sections.forEach((section, sectionIndex) => {
    section.slides.forEach((slide) => {
      flat.push({
        ...slide,
        sectionTitle: section.title,
        sectionIndex,
        globalIndex: flat.length,
      });
    });
  });
  return flat;
}

export default function PrintModal({ isOpen, onClose }: PrintModalProps) {
  const [printMode, setPrintMode] = useState<PrintMode>('rendered');
  const [isPrinting, setIsPrinting] = useState(false);
  const printFrameRef = useRef<HTMLIFrameElement>(null);

  const slides = flattenSlides(presentationData.sections as Section[]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handlePrint = () => {
    setIsPrinting(true);

    // Small delay to ensure the print view renders
    setTimeout(() => {
      if (printFrameRef.current?.contentWindow) {
        printFrameRef.current.contentWindow.print();
      }
      setIsPrinting(false);
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>
              Export to PDF
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Choose how you want to export the slides. Each slide will be printed on a separate landscape page.
          </p>

          {/* Mode selection */}
          <div className="space-y-3 mb-6">
            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
              <input
                type="radio"
                name="printMode"
                value="rendered"
                checked={printMode === 'rendered'}
                onChange={() => setPrintMode('rendered')}
                className="mt-1"
              />
              <div>
                <div className="font-medium">Slide Web View</div>
                <div className="text-sm text-gray-500">
                  Export the formatted web view with proper text, lists, and images
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
              <input
                type="radio"
                name="printMode"
                value="screenshot"
                checked={printMode === 'screenshot'}
                onChange={() => setPrintMode('screenshot')}
                className="mt-1"
              />
              <div>
                <div className="font-medium">Slide Screenshots</div>
                <div className="text-sm text-gray-500">
                  Export the original PowerPoint slide screenshots as images
                </div>
              </div>
            </label>
          </div>

          <div className="text-xs text-gray-400 mb-4">
            {slides.length} slides will be exported
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex-1 px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50"
              style={{ background: 'var(--color-primary)' }}
            >
              {isPrinting ? 'Preparing...' : 'Export PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden print iframe */}
      <iframe
        ref={printFrameRef}
        className="fixed top-0 left-0 w-0 h-0 border-0"
        title="Print Frame"
        srcDoc={generatePrintHTML(slides, printMode)}
      />
    </div>
  );
}

function generatePrintHTML(slides: FlatSlide[], mode: PrintMode): string {
  const slideContents = slides.map((slide, index) => {
    const slideOrder = slide.order || (index + 1);

    if (mode === 'screenshot') {
      const screenshotPath = getScreenshotPath(slideOrder);
      return `
        <div class="slide-page">
          <div class="slide-header">
            <span class="slide-number">${slideOrder}</span>
            <span class="slide-title">${escapeHtml(slide.title)}</span>
            <span class="slide-section">${escapeHtml(slide.sectionTitle)}</span>
          </div>
          <div class="slide-content screenshot">
            <img src="${screenshotPath}" alt="Slide ${slideOrder}" />
          </div>
        </div>
      `;
    } else {
      // Rendered content
      return `
        <div class="slide-page">
          <div class="slide-header">
            <span class="slide-number">${slideOrder}</span>
            <span class="slide-title">${escapeHtml(slide.title)}</span>
            <span class="slide-section">${escapeHtml(slide.sectionTitle)}</span>
          </div>
          <div class="slide-content rendered">
            <h1>${escapeHtml(slide.title)}</h1>
            ${renderSlideContent(slide)}
          </div>
        </div>
      `;
    }
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Slide Export</title>
      <style>
        @page {
          size: landscape;
          margin: 0.5in;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 12pt;
          line-height: 1.4;
          color: #333;
        }

        .slide-page {
          page-break-after: always;
          height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 0.25in;
        }

        .slide-page:last-child {
          page-break-after: auto;
        }

        .slide-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #1e3a5f;
          margin-bottom: 0.5rem;
          flex-shrink: 0;
        }

        .slide-number {
          background: #1e3a5f;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-weight: bold;
          font-size: 10pt;
        }

        .slide-title {
          font-weight: 600;
          font-size: 14pt;
          flex: 1;
        }

        .slide-section {
          font-size: 10pt;
          color: #666;
        }

        .slide-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .slide-content.screenshot img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .slide-content.rendered {
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
          padding: 1rem;
          overflow: auto;
        }

        .slide-content.rendered h1 {
          font-size: 18pt;
          margin-bottom: 1rem;
          color: #1e3a5f;
        }

        .slide-content.rendered ul {
          margin-left: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .slide-content.rendered li {
          margin-bottom: 0.5rem;
        }

        .slide-content.rendered p {
          margin-bottom: 0.75rem;
        }

        .slide-content.rendered .content-image {
          max-width: 60%;
          max-height: 300px;
          margin: 1rem 0;
        }

        @media print {
          .slide-page {
            height: 100vh;
          }
        }
      </style>
    </head>
    <body>
      ${slideContents}
    </body>
    </html>
  `;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderSlideContent(slide: FlatSlide): string {
  return slide.content.map(block => {
    switch (block.type) {
      case 'list':
        return `<ul>${(block as any).items.map((item: any) => `
          <li>${escapeHtml(item.text)}${item.children?.length ? `<ul>${item.children.map((c: any) => `<li>${escapeHtml(c.text)}</li>`).join('')}</ul>` : ''}</li>
        `).join('')}</ul>`;
      case 'image':
        if (block.src) {
          return `<img class="content-image" src="${block.src}" alt="${escapeHtml(block.alt || '')}" />`;
        }
        return '';
      case 'heading':
        return `<h2>${escapeHtml((block as any).text || '')}</h2>`;
      default:
        return '';
    }
  }).join('');
}
