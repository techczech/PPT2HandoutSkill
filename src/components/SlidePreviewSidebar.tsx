import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getScreenshotPath, hasScreenshot } from '../utils/screenshotMapping';
import { flattenSlides } from '../utils/slideHelpers';
import presentationData from '../data/presentation.json';
import type { Section } from '../data/types';

const allSlides = flattenSlides(presentationData.sections as Section[]);

interface SlidePreviewSidebarProps {
  slideNumber: number;
  onClose: () => void;
  isPinned: boolean;
  onTogglePin: () => void;
  sectionSlides?: number[];
  onSlideChange?: (slideNumber: number) => void;
}

function SlideCard({
  num,
  isActive,
  onClick,
}: {
  num: number;
  isActive: boolean;
  onClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const slide = allSlides.find(s => s.order === num);
  const title = slide?.title || `Slide ${num}`;
  const path = getScreenshotPath(num);
  const hasShot = hasScreenshot(num);

  // Auto-scroll active card into view
  useEffect(() => {
    if (isActive && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isActive]);

  return (
    <div
      ref={ref}
      className={`sidebar-slide-card${isActive ? ' active' : ''}`}
      onClick={onClick}
    >
      <div className="screenshot-container">
        {hasShot && path ? (
          <img
            src={path}
            alt={`Screenshot of slide ${num}: ${title}`}
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-xs" style={{ color: 'var(--color-text-muted)' }}>
            No screenshot
          </div>
        )}
      </div>
      <div className="sidebar-slide-card-label">
        <span className="sidebar-slide-card-num">{num}</span>
        <span className="sidebar-slide-card-title">{title}</span>
        <Link
          to={`/slides/${num}`}
          className="sidebar-slide-card-link"
          onClick={(e) => e.stopPropagation()}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

export default function SlidePreviewSidebar({
  slideNumber,
  onClose,
  isPinned,
  onTogglePin,
  sectionSlides = [],
  onSlideChange,
}: SlidePreviewSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const slide = allSlides.find(s => s.order === slideNumber);
  const sectionTitle = slide?.sectionTitle;

  // Close on Escape when unpinned
  useEffect(() => {
    if (isPinned) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isPinned, onClose]);

  // Close on click outside when unpinned
  useEffect(() => {
    if (isPinned) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-slide-link]')) return;
      if (sidebarRef.current && !sidebarRef.current.contains(target)) {
        onClose();
      }
    };
    const id = setTimeout(() => {
      document.addEventListener('mousedown', handleClick);
    }, 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [isPinned, onClose]);

  return (
    <div className="slide-preview-sidebar" ref={sidebarRef}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold px-2 py-1 rounded"
            style={{ background: 'var(--color-primary)', color: 'white' }}
          >
            {sectionSlides.length > 1
              ? `${sectionSlides.length} slides`
              : `Slide ${slideNumber}`}
          </span>
          {sectionTitle && (
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {sectionTitle}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onTogglePin}
            className="sidebar-icon-btn"
            title={isPinned ? 'Unpin sidebar' : 'Pin sidebar open'}
            aria-label={isPinned ? 'Unpin sidebar' : 'Pin sidebar open'}
          >
            <svg
              className="w-4 h-4"
              fill={isPinned ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{
                transform: isPinned ? 'rotate(0deg)' : 'rotate(45deg)',
                transition: 'transform 0.2s ease',
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="sidebar-icon-btn"
            title="Close preview"
            aria-label="Close preview"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* All section slides stacked */}
      <div className="sidebar-slides-stack">
        {(sectionSlides.length > 1 ? sectionSlides : [slideNumber]).map(num => (
          <SlideCard
            key={num}
            num={num}
            isActive={num === slideNumber}
            onClick={() => onSlideChange?.(num)}
          />
        ))}
      </div>

    </div>
  );
}
