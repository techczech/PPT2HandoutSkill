import { Link, useLocation } from 'react-router-dom';

export default function SiteHeader() {
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
          Vibecoding for LTs
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            to="/"
            className={isActive('/') && location.pathname === '/' ? 'active' : ''}
          >
            Home
          </Link>
          <Link
            to="/slides"
            className={isActive('/slides') ? 'active' : ''}
          >
            Slides
          </Link>
          <Link
            to="/resources"
            className={isActive('/resources') ? 'active' : ''}
          >
            Resources
          </Link>
        </nav>
      </div>
    </header>
  );
}
