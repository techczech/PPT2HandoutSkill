import { useEffect, useRef } from 'react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { category: 'Navigation', items: [
    { keys: ['h'], description: 'Go to Home' },
    { keys: ['s'], description: 'Go to Slides' },
    { keys: ['m'], description: 'Go to Media Gallery' },
    { keys: ['r'], description: 'Go to Resources' },
  ]},
  { category: 'Slide Navigation (on Slides page)', items: [
    { keys: ['←', '→'], description: 'Previous / Next slide' },
    { keys: ['Space'], description: 'Next slide' },
    { keys: ['↑', '↓'], description: 'Previous / Next section' },
    { keys: ['Home', 'End'], description: 'First / Last slide' },
  ]},
  { category: 'Other', items: [
    { keys: ['/'], description: 'Open search' },
    { keys: ['?'], description: 'Show keyboard shortcuts' },
    { keys: ['Esc'], description: 'Close modal' },
  ]},
];

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        ref={modalRef}
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
        >
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-primary)' }}>
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          {shortcuts.map((section, sectionIndex) => (
            <div key={sectionIndex} className={sectionIndex > 0 ? 'mt-6' : ''}>
              <h3
                className="text-xs uppercase tracking-wider font-medium mb-3"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="text-sm" style={{ color: 'var(--color-text)' }}>
                      {item.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key, keyIndex) => (
                        <kbd
                          key={keyIndex}
                          className="px-2 py-1 text-xs font-mono bg-gray-100 border border-gray-300 rounded shadow-sm"
                          style={{ color: 'var(--color-text)' }}
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-3 border-t text-center"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
        >
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Press <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">Esc</kbd> or <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">?</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}
