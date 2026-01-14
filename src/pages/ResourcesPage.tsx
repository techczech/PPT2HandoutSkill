import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { extractResources } from '../utils/extractResources';
import presentationData from '../data/presentation.json';
import type { Presentation, ExtractedResources } from '../data/types';
import { sessionInfo } from '../data/sessionInfo';
import ResourceCard, { type ResourceItem, type ResourceType } from '../components/resources/ResourceCard';
import ResourceDetailModal from '../components/resources/ResourceDetailModal';

type FilterType = 'all' | Exclude<ResourceType, 'image'>;

interface FilterTab {
  id: FilterType;
  label: string;
  icon: string;
  color: string;
}

const FILTER_TABS: FilterTab[] = [
  { id: 'all', label: 'All', icon: '📋', color: '#64748b' },
  { id: 'person', label: 'People', icon: '👤', color: '#6366f1' },
  { id: 'organization', label: 'Companies', icon: '🏢', color: '#0891b2' },
  { id: 'place', label: 'Places', icon: '📍', color: '#059669' },
  { id: 'date', label: 'Dates', icon: '📅', color: '#d97706' },
  { id: 'quote', label: 'Quotes', icon: '💬', color: '#7c3aed' },
  { id: 'tool', label: 'Tools', icon: '🔧', color: '#2563eb' },
  { id: 'link', label: 'Links', icon: '🔗', color: '#0d9488' },
  { id: 'term', label: 'Terms', icon: '📖', color: '#4f46e5' },
];

export default function ResourcesPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedItem, setSelectedItem] = useState<ResourceItem | null>(null);

  const resources = useMemo(() => {
    return extractResources(presentationData as Presentation);
  }, []);

  // Convert all resources to unified ResourceItem format
  const allItems = useMemo((): ResourceItem[] => {
    const items: ResourceItem[] = [];

    resources.people.forEach(data => items.push({ type: 'person', data }));
    resources.organizations.forEach(data => items.push({ type: 'organization', data }));
    resources.places.forEach(data => items.push({ type: 'place', data }));
    resources.dates.forEach(data => items.push({ type: 'date', data }));
    resources.quotes.forEach(data => items.push({ type: 'quote', data }));
    // Images are shown in Media Gallery instead
    resources.tools.forEach(data => items.push({ type: 'tool', data }));
    resources.links.forEach(data => items.push({ type: 'link', data }));
    resources.terms.forEach(data => items.push({ type: 'term', data }));

    return items;
  }, [resources]);

  // Filter items based on active filter
  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return allItems;
    return allItems.filter(item => item.type === activeFilter);
  }, [allItems, activeFilter]);

  // Get counts for each category (excluding images - shown in Media Gallery)
  const getCounts = (res: ExtractedResources): Record<FilterType, number> => ({
    all: res.people.length + res.organizations.length + res.places.length +
         res.dates.length + res.quotes.length +
         res.tools.length + res.links.length + res.terms.length,
    person: res.people.length,
    organization: res.organizations.length,
    place: res.places.length,
    date: res.dates.length,
    quote: res.quotes.length,
    tool: res.tools.length,
    link: res.links.length,
    term: res.terms.length,
  });

  const counts = getCounts(resources);
  const sessionType = sessionInfo.event?.type || 'presentation';

  return (
    <div className="page-container">
      {/* Header */}
      <div className="hero">
        <div className="flex items-center gap-4 mb-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Link>
        </div>
        <h1 className="font-serif">Resources & Entities</h1>
        <p className="mt-2 text-white/80">
          People, organizations, dates, quotes, and more from the {sessionType.toLowerCase()}
        </p>
      </div>

      {/* Content */}
      <div className="page-content">
        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {FILTER_TABS.filter(tab => counts[tab.id] > 0 || tab.id === 'all').map(tab => {
            const isActive = activeFilter === tab.id;
            const count = counts[tab.id];

            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                  whitespace-nowrap transition-all
                  ${isActive ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
                style={{
                  backgroundColor: isActive ? tab.color : undefined,
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span
                  className={`
                    px-1.5 py-0.5 rounded-full text-xs
                    ${isActive ? 'bg-white/20' : 'bg-gray-200'}
                  `}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Gallery Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No items found in this category
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item, index) => (
              <ResourceCard
                key={`${item.type}-${index}`}
                item={item}
                onClick={() => setSelectedItem(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <ResourceDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}
