import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigation } from '../../hooks/useNavigation';

interface SectionSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SectionSidebar({ isOpen, onClose }: SectionSidebarProps) {
  const { sections, sectionBounds, currentIndex, goToSlide, currentSectionIndex, totalSlides } = useNavigation();
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([currentSectionIndex]));

  const toggleSection = (sectionIndex: number) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionIndex)) {
        newSet.delete(sectionIndex);
      } else {
        newSet.add(sectionIndex);
      }
      return newSet;
    });
  };

  const handleSlideClick = (slideIndex: number) => {
    goToSlide(slideIndex);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="sidebar-overlay md:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside className={`section-sidebar ${isOpen ? 'open' : ''} md:block`}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ color: 'var(--color-primary)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>

        <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
          <p className="text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--color-text-muted)' }}>
            Progress
          </p>
          <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
            {currentIndex + 1} <span className="text-sm font-normal" style={{ color: 'var(--color-text-muted)' }}>/ {totalSlides}</span>
          </p>
        </div>

        <nav className="py-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          <p className="px-4 py-2 text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--color-text-muted)' }}>
            Sections
          </p>
          {sections.map((section, sectionIndex) => {
            const bound = sectionBounds[sectionIndex];
            const isActiveSection = currentIndex >= bound.start && currentIndex <= bound.end;
            const isExpanded = expandedSections.has(sectionIndex);
            const slideCount = section.slides.length;

            return (
              <div key={sectionIndex}>
                {/* Section header */}
                <button
                  onClick={() => toggleSection(sectionIndex)}
                  className={`section-sidebar-item w-full text-left ${isActiveSection ? 'active' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <svg
                        className={`w-3 h-3 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="truncate">{section.title}</span>
                    </div>
                    <span className="text-xs shrink-0" style={{ color: isActiveSection ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
                      {slideCount}
                    </span>
                  </div>
                </button>

                {/* Expanded slide list */}
                {isExpanded && (
                  <div className="ml-4 border-l-2" style={{ borderColor: 'var(--color-border)' }}>
                    {section.slides.map((slide, slideIdx) => {
                      const globalSlideIndex = bound.start + slideIdx;
                      const isCurrentSlide = currentIndex === globalSlideIndex;

                      return (
                        <button
                          key={slideIdx}
                          onClick={() => handleSlideClick(globalSlideIndex)}
                          className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 transition-colors ${
                            isCurrentSlide ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-xs shrink-0 mt-0.5" style={{ color: isCurrentSlide ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
                              {globalSlideIndex + 1}
                            </span>
                            <span className="line-clamp-2">{slide.title || 'Untitled slide'}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
