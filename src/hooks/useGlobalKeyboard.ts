import { useEffect, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface GlobalKeyboardState {
  isSearchOpen: boolean;
  isHelpOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  openHelp: () => void;
  closeHelp: () => void;
}

export function useGlobalKeyboard(): GlobalKeyboardState {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);
  const openHelp = useCallback(() => setIsHelpOpen(true), []);
  const closeHelp = useCallback(() => setIsHelpOpen(false), []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Ignore if typing in an input or textarea
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Ignore if a modal is open (except Escape to close)
      if (isSearchOpen || isHelpOpen) {
        if (event.key === 'Escape') {
          event.preventDefault();
          setIsSearchOpen(false);
          setIsHelpOpen(false);
        }
        return;
      }

      switch (event.key) {
        // Search: /
        case '/':
          event.preventDefault();
          setIsSearchOpen(true);
          break;

        // Help: ?
        case '?':
          event.preventDefault();
          setIsHelpOpen(true);
          break;

        // Home: h
        case 'h':
        case 'H':
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            navigate('/');
          }
          break;

        // Slides: s
        case 's':
        case 'S':
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            // If already on slides, go to slide 1, otherwise go to slides
            if (location.pathname.startsWith('/slides')) {
              navigate('/slides/1');
            } else {
              navigate('/slides');
            }
          }
          break;

        // Media: m
        case 'm':
        case 'M':
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            navigate('/media-gallery');
          }
          break;

        // Index: i
        case 'i':
        case 'I':
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            navigate('/resources');
          }
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, location.pathname, isSearchOpen, isHelpOpen]);

  return {
    isSearchOpen,
    isHelpOpen,
    openSearch,
    closeSearch,
    openHelp,
    closeHelp,
  };
}
