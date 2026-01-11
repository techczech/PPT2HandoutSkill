import { Link } from 'react-router-dom';
import { useNavigation } from '../../hooks/useNavigation';

interface SectionSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SectionSidebar({ isOpen, onClose }: SectionSidebarProps) {
  const { sections, sectionBounds, currentIndex, goToSection, currentIndex: slideIndex, totalSlides } = useNavigation();

  const handleSectionClick = (sectionIndex: number) => {
    goToSection(sectionIndex);
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
            {slideIndex + 1} <span className="text-sm font-normal" style={{ color: 'var(--color-text-muted)' }}>/ {totalSlides}</span>
          </p>
        </div>

        <nav className="py-2">
          <p className="px-4 py-2 text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--color-text-muted)' }}>
            Sections
          </p>
          {sections.map((section, index) => {
            const bound = sectionBounds[index];
            const isActive = currentIndex >= bound.start && currentIndex <= bound.end;
            const slideCount = section.slides.length;

            return (
              <button
                key={index}
                onClick={() => handleSectionClick(index)}
                className={`section-sidebar-item w-full text-left ${isActive ? 'active' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate pr-2">{section.title}</span>
                  <span className="text-xs shrink-0" style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
                    {slideCount}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
