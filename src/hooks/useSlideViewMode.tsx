import { createContext, useContext, useState, ReactNode } from 'react';

type ViewMode = 'content' | 'screenshot' | 'outline';

interface SlideViewModeContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
}

const SlideViewModeContext = createContext<SlideViewModeContextType | null>(null);

export function SlideViewModeProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('content');

  const toggleViewMode = () => {
    // Cycle through: content -> screenshot -> outline -> content
    setViewMode(prev => {
      if (prev === 'content') return 'screenshot';
      if (prev === 'screenshot') return 'outline';
      return 'content';
    });
  };

  return (
    <SlideViewModeContext.Provider value={{ viewMode, setViewMode, toggleViewMode }}>
      {children}
    </SlideViewModeContext.Provider>
  );
}

export function useSlideViewMode() {
  const context = useContext(SlideViewModeContext);
  if (!context) {
    throw new Error('useSlideViewMode must be used within a SlideViewModeProvider');
  }
  return context;
}
