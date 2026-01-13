import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SearchResult } from '../../hooks/useSearch';

interface SearchModalProps {
  isOpen: boolean;
  query: string;
  results: SearchResult[];
  onQueryChange: (query: string) => void;
  onClose: () => void;
}

export default function SearchModal({
  isOpen,
  query,
  results,
  onQueryChange,
  onClose,
}: SearchModalProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Handle clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const handleResultClick = (slideIndex: number) => {
    navigate(`/slides/${slideIndex + 1}`);
    onClose();
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 text-gray-900 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50">
      <div
        ref={modalRef}
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden"
      >
        {/* Search input */}
        <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-gray-400 shrink-0"
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
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search slides, content, and speaker notes..."
              className="flex-1 text-lg outline-none placeholder-gray-400"
            />
            <kbd className="hidden sm:inline-block px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded">
              ESC
            </kbd>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {query.length < 2 ? (
            <div className="p-8 text-center text-gray-500">
              Type at least 2 characters to search
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No results found for "{query}"
            </div>
          ) : (
            <ul className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {results.map((result, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleResultClick(result.slideIndex)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="shrink-0 px-2 py-0.5 text-xs font-medium rounded"
                        style={{
                          background: 'var(--color-surface)',
                          color: 'var(--color-accent)',
                        }}
                      >
                        {result.slideIndex + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {highlightMatch(result.slideTitle, query)}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {result.sectionTitle}
                        </p>
                        {result.matchContext && (
                          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                            {highlightMatch(result.matchContext, query)}
                          </p>
                        )}
                        <span
                          className="inline-block mt-1 px-1.5 py-0.5 text-xs rounded"
                          style={{
                            background:
                              result.matchType === 'notes'
                                ? 'rgba(224, 122, 56, 0.1)'
                                : 'var(--color-surface)',
                            color:
                              result.matchType === 'notes'
                                ? 'var(--color-accent)'
                                : 'var(--color-text-muted)',
                          }}
                        >
                          {result.matchType === 'notes' ? 'Speaker notes' : result.matchType}
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer hint */}
        <div
          className="px-4 py-2 text-xs text-gray-500 border-t"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
        >
          Press <kbd className="px-1 py-0.5 bg-white rounded shadow-sm">Enter</kbd> to select
          · <kbd className="px-1 py-0.5 bg-white rounded shadow-sm">↑↓</kbd> to navigate
          · <kbd className="px-1 py-0.5 bg-white rounded shadow-sm">Esc</kbd> to close
        </div>
      </div>
    </div>
  );
}
