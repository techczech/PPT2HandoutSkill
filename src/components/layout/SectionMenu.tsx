import { useNavigation } from '../../hooks/useNavigation';

interface SectionMenuProps {
  onClose: () => void;
}

export default function SectionMenu({ onClose }: SectionMenuProps) {
  const { sections, sectionBounds, currentIndex, goToSection } = useNavigation();

  const handleSectionClick = (sectionIndex: number) => {
    goToSection(sectionIndex);
    onClose();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-64 max-h-96 overflow-y-auto">
      <div className="px-4 py-2 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Sections</h3>
      </div>
      <nav className="py-1">
        {sections.map((section, index) => {
          const bound = sectionBounds[index];
          const isActive = currentIndex >= bound.start && currentIndex <= bound.end;
          const slideCount = section.slides.length;

          return (
            <button
              key={index}
              onClick={() => handleSectionClick(index)}
              className={`w-full text-left px-4 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              <span className="truncate pr-2">{section.title}</span>
              <span className={`text-xs ${isActive ? 'text-blue-500' : 'text-gray-400'}`}>
                {slideCount} slide{slideCount !== 1 ? 's' : ''}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
