import { Link } from 'react-router-dom';
import type {
  PersonResource,
  OrganizationResource,
  PlaceResource,
  DateResource,
  QuoteResource,
  ImageResource,
  ToolResource,
  TermResource,
  LinkResource,
} from '../../data/types';

export type ResourceType =
  | 'person'
  | 'organization'
  | 'place'
  | 'date'
  | 'quote'
  | 'image'
  | 'tool'
  | 'term'
  | 'link';

export type ResourceItem =
  | { type: 'person'; data: PersonResource }
  | { type: 'organization'; data: OrganizationResource }
  | { type: 'place'; data: PlaceResource }
  | { type: 'date'; data: DateResource }
  | { type: 'quote'; data: QuoteResource }
  | { type: 'image'; data: ImageResource }
  | { type: 'tool'; data: ToolResource }
  | { type: 'term'; data: TermResource }
  | { type: 'link'; data: LinkResource };

interface ResourceListItemProps {
  item: ResourceItem;
  onClick?: () => void;
}

// Icons for each resource type
const typeIcons: Record<ResourceType, string> = {
  person: '👤',
  organization: '🏢',
  place: '📍',
  date: '📅',
  quote: '💬',
  image: '🖼️',
  tool: '🔧',
  term: '📖',
  link: '🔗',
};

// Colors for each resource type
const typeColors: Record<ResourceType, string> = {
  person: '#6366f1', // indigo
  organization: '#0891b2', // cyan
  place: '#059669', // emerald
  date: '#d97706', // amber
  quote: '#7c3aed', // violet
  image: '#db2777', // pink
  tool: '#2563eb', // blue
  term: '#4f46e5', // indigo
  link: '#0d9488', // teal
};

export default function ResourceListItem({ item, onClick }: ResourceListItemProps) {
  const icon = typeIcons[item.type];
  const color = typeColors[item.type];

  const renderContent = () => {
    switch (item.type) {
      case 'person': {
        const { name, role, context, slideIndex } = item.data;
        return (
          <>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium" style={{ color: 'var(--color-text)' }}>{name}</h3>
              {role && <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{role}</p>}
              {context && !role && <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{context}</p>}
            </div>
            {slideIndex !== undefined && (
              <Link
                to={`/slides/${slideIndex + 1}`}
                className="text-sm hover:underline shrink-0"
                style={{ color }}
                onClick={(e) => e.stopPropagation()}
              >
                Slide {slideIndex + 1}
              </Link>
            )}
          </>
        );
      }
      case 'organization': {
        const { name, context, slideIndex } = item.data;
        return (
          <>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium" style={{ color: 'var(--color-text)' }}>{name}</h3>
              {context && <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{context}</p>}
            </div>
            {slideIndex !== undefined && (
              <Link
                to={`/slides/${slideIndex + 1}`}
                className="text-sm hover:underline shrink-0"
                style={{ color }}
                onClick={(e) => e.stopPropagation()}
              >
                Slide {slideIndex + 1}
              </Link>
            )}
          </>
        );
      }
      case 'place': {
        const { name, type, slideIndex } = item.data;
        return (
          <>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium" style={{ color: 'var(--color-text)' }}>{name}</h3>
              <p className="text-sm capitalize" style={{ color: 'var(--color-text-muted)' }}>{type}</p>
            </div>
            {slideIndex !== undefined && (
              <Link
                to={`/slides/${slideIndex + 1}`}
                className="text-sm hover:underline shrink-0"
                style={{ color }}
                onClick={(e) => e.stopPropagation()}
              >
                Slide {slideIndex + 1}
              </Link>
            )}
          </>
        );
      }
      case 'date': {
        const { formatted, context, slideIndex } = item.data;
        return (
          <>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium" style={{ color: 'var(--color-text)' }}>{formatted}</h3>
              {context && <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{context}</p>}
            </div>
            {slideIndex !== undefined && (
              <Link
                to={`/slides/${slideIndex + 1}`}
                className="text-sm hover:underline shrink-0"
                style={{ color }}
                onClick={(e) => e.stopPropagation()}
              >
                Slide {slideIndex + 1}
              </Link>
            )}
          </>
        );
      }
      case 'quote': {
        const { text, attribution, slideIndex } = item.data;
        return (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-sm italic" style={{ color: 'var(--color-text)' }}>"{text}"</p>
              {attribution && (
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>— {attribution}</p>
              )}
            </div>
            {slideIndex !== undefined && (
              <Link
                to={`/slides/${slideIndex + 1}`}
                className="text-sm hover:underline shrink-0"
                style={{ color }}
                onClick={(e) => e.stopPropagation()}
              >
                Slide {slideIndex + 1}
              </Link>
            )}
          </>
        );
      }
      case 'image': {
        const { src, slideTitle, description, slideIndex } = item.data;
        return (
          <>
            <img
              src={src}
              alt={slideTitle}
              className="w-16 h-16 object-cover rounded shrink-0"
              loading="lazy"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium" style={{ color: 'var(--color-text)' }}>{slideTitle}</h3>
              {description && <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{description}</p>}
            </div>
            {slideIndex !== undefined && (
              <Link
                to={`/slides/${slideIndex + 1}`}
                className="text-sm hover:underline shrink-0"
                style={{ color }}
                onClick={(e) => e.stopPropagation()}
              >
                Slide {slideIndex + 1}
              </Link>
            )}
          </>
        );
      }
      case 'tool': {
        const { name, description } = item.data;
        return (
          <div className="flex-1 min-w-0">
            <h3 className="font-medium" style={{ color: 'var(--color-text)' }}>{name}</h3>
            {description && <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{description}</p>}
          </div>
        );
      }
      case 'term': {
        const { term, context } = item.data;
        return (
          <div className="flex-1 min-w-0">
            <h3 className="font-medium" style={{ color: 'var(--color-text)' }}>{term}</h3>
            {context && <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{context}</p>}
          </div>
        );
      }
      case 'link': {
        const { url, label, slideIndex } = item.data;
        return (
          <>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium" style={{ color: 'var(--color-text)' }}>{label}</h3>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:underline break-all"
                style={{ color }}
                onClick={(e) => e.stopPropagation()}
              >
                {url}
              </a>
            </div>
            {slideIndex !== undefined && (
              <Link
                to={`/slides/${slideIndex + 1}`}
                className="text-sm hover:underline shrink-0"
                style={{ color }}
                onClick={(e) => e.stopPropagation()}
              >
                Slide {slideIndex + 1}
              </Link>
            )}
          </>
        );
      }
    }
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left py-3 px-2 transition-all hover:bg-gray-50 flex gap-4 items-center"
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-lg"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {icon}
      </div>
      {renderContent()}
    </button>
  );
}
