import { Link, useLocation } from 'react-router-dom';
import { sessionInfo } from '../../data/sessionInfo';

interface SiteHeaderProps {
  onOpenSearch?: () => void;
  onOpenHelp?: () => void;
}

export default function SiteHeader({ onOpenSearch, onOpenHelp }: SiteHeaderProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="site-header" style={{ height: 'var(--nav-height)' }}>
      <div
        className="max-w-7xl mx-auto h-full flex items-center justify-between"
        style={{ padding: '0 var(--spacing-page-x)' }}
      >
        <Link to="/" className="font-semibold text-lg" style={{ color: 'var(--color-primary)' }}>
          {sessionInfo.title}
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            to="/"
            className={isActive('/') && location.pathname === '/' ? 'active' : ''}
            title="Home (h)"
          >
            <u>H</u>ome
          </Link>
          <Link
            to="/slides"
            className={isActive('/slides') ? 'active' : ''}
            title="Slides (s)"
          >
            <u>S</u>lides
          </Link>
          <Link
            to="/resources"
            className={isActive('/resources') ? 'active' : ''}
            title="Index (i)"
          >
            <u>I</u>ndex
          </Link>
          <Link
            to="/media-gallery"
            className={isActive('/media-gallery') ? 'active' : ''}
            title="Media Gallery (m)"
          >
            <u>M</u>edia
          </Link>
          <Link
            to="/about"
            className={isActive('/about') ? 'active' : ''}
            title="About (a)"
          >
            <u>A</u>bout
          </Link>

          {/* Divider */}
          <div
            className="w-px h-5 mx-2"
            style={{ backgroundColor: 'var(--color-border)' }}
          />

          {/* Search button */}
          <button
            onClick={onOpenSearch}
            className="nav-icon-button"
            title="Search (/)"
            aria-label="Search"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>

          {/* Help button */}
          <button
            onClick={onOpenHelp}
            className="nav-icon-button"
            title="Keyboard shortcuts (?)"
            aria-label="Keyboard shortcuts"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </nav>
      </div>
    </header>
  );
}
