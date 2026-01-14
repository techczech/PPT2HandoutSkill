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

interface ResourceCardProps {
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

export default function ResourceCard({ item, onClick }: ResourceCardProps) {
  const icon = typeIcons[item.type];
  const color = typeColors[item.type];

  const renderContent = () => {
    switch (item.type) {
      case 'person': {
        const { name, role, context } = item.data;
        return (
          <>
            <h3 className="font-medium text-sm line-clamp-1">{name}</h3>
            {role && <p className="text-xs opacity-70 line-clamp-1">{role}</p>}
            {context && !role && <p className="text-xs opacity-60 line-clamp-1">{context}</p>}
          </>
        );
      }
      case 'organization': {
        const { name, context } = item.data;
        return (
          <>
            <h3 className="font-medium text-sm line-clamp-1">{name}</h3>
            {context && <p className="text-xs opacity-60 line-clamp-1">{context}</p>}
          </>
        );
      }
      case 'place': {
        const { name, type } = item.data;
        return (
          <>
            <h3 className="font-medium text-sm line-clamp-1">{name}</h3>
            <p className="text-xs opacity-60 capitalize">{type}</p>
          </>
        );
      }
      case 'date': {
        const { formatted, context } = item.data;
        return (
          <>
            <h3 className="font-medium text-sm line-clamp-1">{formatted}</h3>
            {context && <p className="text-xs opacity-60 line-clamp-1">{context}</p>}
          </>
        );
      }
      case 'quote': {
        const { text, attribution } = item.data;
        return (
          <>
            <p className="text-xs italic line-clamp-2">"{text.substring(0, 80)}..."</p>
            {attribution && <p className="text-xs opacity-60 mt-1 line-clamp-1">— {attribution}</p>}
          </>
        );
      }
      case 'image': {
        const { src, slideTitle, description } = item.data;
        return (
          <div className="relative w-full h-full">
            <img
              src={src}
              alt={slideTitle}
              className="w-full h-full object-cover rounded"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 rounded-b">
              <p className="text-xs text-white line-clamp-1">{description || slideTitle}</p>
            </div>
          </div>
        );
      }
      case 'tool': {
        const { name, description } = item.data;
        return (
          <>
            <h3 className="font-medium text-sm line-clamp-1">{name}</h3>
            {description && <p className="text-xs opacity-60 line-clamp-2">{description}</p>}
          </>
        );
      }
      case 'term': {
        const { term, context } = item.data;
        return (
          <>
            <h3 className="font-medium text-sm line-clamp-1">{term}</h3>
            {context && <p className="text-xs opacity-60 line-clamp-2">{context}</p>}
          </>
        );
      }
      case 'link': {
        const { url, label, slideIndex } = item.data;
        return (
          <>
            <h3 className="font-medium text-sm line-clamp-1 break-all">{label}</h3>
            <p className="text-xs opacity-60 line-clamp-1 break-all">{url}</p>
            {slideIndex !== undefined && (
              <Link
                to={`/slides/${slideIndex + 1}`}
                className="text-xs mt-1 hover:underline"
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

  // Special layout for images
  if (item.type === 'image') {
    return (
      <button
        onClick={onClick}
        className="resource-card p-0 overflow-hidden aspect-video w-full text-left transition-all hover:ring-2"
        style={{ '--tw-ring-color': color } as React.CSSProperties}
      >
        {renderContent()}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="resource-card p-3 w-full text-left transition-all hover:ring-2 flex gap-3 items-start"
      style={{ '--tw-ring-color': color } as React.CSSProperties}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-lg"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">{renderContent()}</div>
    </button>
  );
}
