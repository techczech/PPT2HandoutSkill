import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import SiteHeader from './components/layout/SiteHeader';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import SlidesPage from './pages/SlidesPage';
import ResourcesPage from './pages/ResourcesPage';
import MediaGalleryPage from './pages/MediaGalleryPage';
import AboutPage from './pages/AboutPage';
import { useGlobalKeyboard } from './hooks/useGlobalKeyboard';
import { useSearch } from './hooks/useSearch';
import SearchModal from './components/search/SearchModal';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import { sessionInfo } from './data/sessionInfo';

function AppContent() {
  const keyboard = useGlobalKeyboard();
  const search = useSearch();

  // Set document title from sessionInfo
  useEffect(() => {
    document.title = sessionInfo.title;
  }, []);

  // Sync keyboard state with search state
  const isSearchOpen = keyboard.isSearchOpen;
  const closeSearch = () => {
    keyboard.closeSearch();
    search.close();
  };

  // Open search when keyboard shortcut triggers
  if (isSearchOpen && !search.isOpen) {
    search.open();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader onOpenSearch={keyboard.openSearch} onOpenHelp={keyboard.openHelp} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/slides" element={<SlidesPage />} />
          <Route path="/slides/:slideNumber" element={<SlidesPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/media-gallery" element={<MediaGalleryPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
      <Footer />

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        query={search.query}
        results={search.results}
        onQueryChange={search.setQuery}
        onClose={closeSearch}
      />

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsModal
        isOpen={keyboard.isHelpOpen}
        onClose={keyboard.closeHelp}
      />
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
