import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { NavigationProvider } from '../hooks/useNavigation';
import SectionSidebar from '../components/layout/SectionSidebar';
import SlideViewContent from '../components/layout/SlideViewContent';

export default function SlidesPage() {
  const { slideNumber } = useParams<{ slideNumber: string }>();

  // Redirect /slides to /slides/1
  if (!slideNumber) {
    return <Navigate to="/slides/1" replace />;
  }

  return (
    <NavigationProvider>
      <SlidesPageContent />
    </NavigationProvider>
  );
}

function SlidesPageContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-var(--nav-height))]">
      {/* Sidebar */}
      <SectionSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header with menu toggle */}
        <div className="md:hidden p-4 flex items-center gap-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ background: 'var(--color-surface)', color: 'var(--color-primary)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Sections
          </button>
        </div>

        <SlideViewContent />
      </div>
    </div>
  );
}
