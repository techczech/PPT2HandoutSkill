import { Link } from 'react-router-dom';
import type { ResourceItem, ResourceType } from './ResourceCard';

interface ResourceDetailModalProps {
  item: ResourceItem | null;
  onClose: () => void;
}

// Labels for each resource type
const typeLabels: Record<ResourceType, string> = {
  person: 'Person',
  organization: 'Organization',
  place: 'Place',
  date: 'Date',
  quote: 'Quote',
  image: 'Image',
  tool: 'Tool',
  term: 'Term',
  link: 'Link',
};

// Colors for each resource type
const typeColors: Record<ResourceType, string> = {
  person: '#6366f1',
  organization: '#0891b2',
  place: '#059669',
  date: '#d97706',
  quote: '#7c3aed',
  image: '#db2777',
  tool: '#2563eb',
  term: '#4f46e5',
  link: '#0d9488',
};

export default function ResourceDetailModal({ item, onClose }: ResourceDetailModalProps) {
  if (!item) return null;

  const color = typeColors[item.type];
  const label = typeLabels[item.type];

  const renderContent = () => {
    switch (item.type) {
      case 'person': {
        const { name, role, organization, context, slideIndex } = item.data;
        return (
          <>
            <h2 className="text-2xl font-bold mb-2">{name}</h2>
            {role && <p className="text-lg opacity-80 mb-1">{role}</p>}
            {organization && <p className="opacity-70 mb-4">{organization}</p>}
            {context && (
              <div className="mb-4">
                <span className="text-sm font-medium opacity-60">Context:</span>
                <p className="mt-1">{context}</p>
              </div>
            )}
            <Link
              to={`/slides/${slideIndex + 1}`}
              className="btn btn-primary inline-flex"
              onClick={onClose}
            >
              View Slide {slideIndex + 1}
            </Link>
          </>
        );
      }
      case 'organization': {
        const { name, context, slideIndex } = item.data;
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">{name}</h2>
            {context && (
              <div className="mb-4">
                <span className="text-sm font-medium opacity-60">First mentioned:</span>
                <p className="mt-1">{context}</p>
              </div>
            )}
            <Link
              to={`/slides/${slideIndex + 1}`}
              className="btn btn-primary inline-flex"
              onClick={onClose}
            >
              View Slide {slideIndex + 1}
            </Link>
          </>
        );
      }
      case 'place': {
        const { name, type, context, slideIndex } = item.data;
        return (
          <>
            <h2 className="text-2xl font-bold mb-2">{name}</h2>
            <p className="text-lg opacity-70 capitalize mb-4">{type}</p>
            {context && (
              <div className="mb-4">
                <span className="text-sm font-medium opacity-60">Mentioned in:</span>
                <p className="mt-1">{context}</p>
              </div>
            )}
            <Link
              to={`/slides/${slideIndex + 1}`}
              className="btn btn-primary inline-flex"
              onClick={onClose}
            >
              View Slide {slideIndex + 1}
            </Link>
          </>
        );
      }
      case 'date': {
        const { formatted, raw, context, slideIndex } = item.data;
        return (
          <>
            <h2 className="text-2xl font-bold mb-2">{formatted}</h2>
            {raw !== formatted && <p className="opacity-60 mb-4">Original: {raw}</p>}
            {context && (
              <div className="mb-4">
                <span className="text-sm font-medium opacity-60">Context:</span>
                <p className="mt-1">{context}</p>
              </div>
            )}
            <Link
              to={`/slides/${slideIndex + 1}`}
              className="btn btn-primary inline-flex"
              onClick={onClose}
            >
              View Slide {slideIndex + 1}
            </Link>
          </>
        );
      }
      case 'quote': {
        const { text, attribution, slideTitle, slideIndex } = item.data;
        return (
          <>
            <blockquote className="text-xl italic border-l-4 pl-4 mb-4" style={{ borderColor: color }}>
              "{text}"
            </blockquote>
            {attribution && <p className="text-lg opacity-70 mb-4">— {attribution}</p>}
            <div className="mb-4">
              <span className="text-sm font-medium opacity-60">From slide:</span>
              <p className="mt-1">{slideTitle}</p>
            </div>
            <Link
              to={`/slides/${slideIndex + 1}`}
              className="btn btn-primary inline-flex"
              onClick={onClose}
            >
              View Slide {slideIndex + 1}
            </Link>
          </>
        );
      }
      case 'image': {
        const { src, alt, caption, description, slideTitle, sectionTitle, slideIndex } = item.data;
        return (
          <>
            <div className="mb-4">
              <img
                src={src}
                alt={alt || slideTitle}
                className="max-w-full max-h-[50vh] object-contain mx-auto rounded-lg"
              />
            </div>
            {description && (
              <div className="mb-4">
                <span className="text-sm font-medium opacity-60">Description:</span>
                <p className="mt-1">{description}</p>
              </div>
            )}
            {caption && (
              <div className="mb-4">
                <span className="text-sm font-medium opacity-60">Caption:</span>
                <p className="mt-1">{caption}</p>
              </div>
            )}
            <div className="mb-4 text-sm opacity-70">
              <p><strong>Section:</strong> {sectionTitle}</p>
              <p><strong>Slide:</strong> {slideTitle}</p>
            </div>
            <Link
              to={`/slides/${slideIndex + 1}`}
              className="btn btn-primary inline-flex"
              onClick={onClose}
            >
              View Slide {slideIndex + 1}
            </Link>
          </>
        );
      }
      case 'tool': {
        const { name, description } = item.data;
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">{name}</h2>
            {description && <p className="text-lg opacity-80">{description}</p>}
          </>
        );
      }
      case 'term': {
        const { term, context } = item.data;
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">{term}</h2>
            {context && <p className="text-lg opacity-80">{context}</p>}
          </>
        );
      }
      case 'link': {
        const { url, label, slideIndex } = item.data;
        return (
          <>
            <h2 className="text-2xl font-bold mb-2">{label}</h2>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg hover:underline break-all mb-4 block"
              style={{ color }}
            >
              {url}
            </a>
            {slideIndex !== undefined && (
              <Link
                to={`/slides/${slideIndex + 1}`}
                className="btn btn-primary inline-flex"
                onClick={onClose}
              >
                View Slide {slideIndex + 1}
              </Link>
            )}
          </>
        );
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="sticky top-0 flex items-center justify-between p-4 border-b"
          style={{ backgroundColor: `${color}10`, borderColor: `${color}30` }}
        >
          <span
            className="text-sm font-medium px-3 py-1 rounded-full"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {label}
          </span>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/10 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{renderContent()}</div>
      </div>
    </div>
  );
}
