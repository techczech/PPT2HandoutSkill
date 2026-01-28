import { createContext, useContext, useState, ReactNode } from 'react';

type MainView = 'content' | 'outline' | 'grid';
type DisplayMode = 'rendered' | 'screenshot';

interface SlideViewModeContextType {
  mainView: MainView;
  setMainView: (view: MainView) => void;
  displayMode: DisplayMode;
  toggleDisplayMode: () => void;
}

const SlideViewModeContext = createContext<SlideViewModeContextType | null>(null);

export function SlideViewModeProvider({ children }: { children: ReactNode }) {
  const [mainView, setMainView] = useState<MainView>('content');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('rendered');

  const toggleDisplayMode = () => {
    setDisplayMode(prev => prev === 'rendered' ? 'screenshot' : 'rendered');
  };

  return (
    <SlideViewModeContext.Provider value={{ mainView, setMainView, displayMode, toggleDisplayMode }}>
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
