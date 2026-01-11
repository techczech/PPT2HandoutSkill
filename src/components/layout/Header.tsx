import { useState } from 'react';
import { useNavigation } from '../../hooks/useNavigation';
import SectionMenu from './SectionMenu';

export default function Header() {
  const { currentSlide, currentIndex, totalSlides } = useNavigation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between" style={{ height: 'var(--nav-height)' }}>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="hidden sm:inline">Sections</span>
        </button>
        <span className="text-sm text-gray-500 hidden md:block">
          {currentSlide?.sectionTitle}
        </span>
      </div>

      <h1 className="text-sm font-medium text-gray-900 truncate max-w-md hidden lg:block">
        Vibe Coding for Language Teachers
      </h1>

      <div className="text-sm text-gray-500">
        {currentIndex + 1} / {totalSlides}
      </div>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-16 left-4 z-50">
            <SectionMenu onClose={() => setMenuOpen(false)} />
          </div>
        </>
      )}
    </header>
  );
}
