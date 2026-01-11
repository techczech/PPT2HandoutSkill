import { Routes, Route } from 'react-router-dom';
import SiteHeader from './components/layout/SiteHeader';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import SlidesPage from './pages/SlidesPage';
import ResourcesPage from './pages/ResourcesPage';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/slides" element={<SlidesPage />} />
          <Route path="/slides/:slideNumber" element={<SlidesPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
