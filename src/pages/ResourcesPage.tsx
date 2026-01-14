import { useMemo, useState } from 'react';
import { extractResources } from '../utils/extractResources';
import presentationData from '../data/presentation.json';
import type { Presentation, ExtractedResources } from '../data/types';
import { sessionInfo } from '../data/sessionInfo';
import ResourceCard, { type ResourceItem, type ResourceType } from '../components/resources/ResourceCard';
import ResourceDetailModal from '../components/resources/ResourceDetailModal';

type FilterType = 'all' | ResourceType;

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
  { id: 'image', label: 'Images', icon: '🖼️', color: '#db2777' },
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
    resources.images.forEach(data => items.push({ type: 'image', data }));
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

  // Get counts for each category
  const getCounts = (res: ExtractedResources): Record<FilterType, number> => ({
    all: res.people.length + res.organizations.length + res.places.length +
         res.dates.length + res.quotes.length + res.images.length +
         res.tools.length + res.links.length + res.terms.length,
    person: res.people.length,
    organization: res.organizations.length,
    place: res.places.length,
    date: res.dates.length,
    quote: res.quotes.length,
    image: res.images.length,
    tool: res.tools.length,
    link: res.links.length,
    term: res.terms.length,
  });

  const counts = getCounts(resources);
  const sessionType = sessionInfo.event?.type || 'presentation';

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section
        style={{
          padding: 'calc(var(--spacing-page-y) * 1.5) var(--spacing-page-x)',
          background: 'var(--color-primary)',
          color: 'white',
        }}
      >
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
            Resources & Entities
          </h1>
          <p className="opacity-80">
            People, organizations, dates, quotes, and more from the {sessionType.toLowerCase()}
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section
        className="sticky top-[var(--nav-height)] z-30 border-b"
        style={{
          backgroundColor: 'var(--color-bg)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-3 -mx-4 px-4 scrollbar-hide">
            {FILTER_TABS.filter(tab => counts[tab.id] > 0 || tab.id === 'all').map(tab => {
              const isActive = activeFilter === tab.id;
              const count = counts[tab.id];

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium
                    whitespace-nowrap transition-all shrink-0
                    ${isActive ? 'text-white' : 'hover:bg-gray-100'}
                  `}
                  style={{
                    backgroundColor: isActive ? tab.color : undefined,
                    color: isActive ? 'white' : 'var(--color-text)',
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
        </div>
      </section>

      {/* Gallery Grid */}
      <section style={{ padding: 'var(--spacing-page-y) var(--spacing-page-x)' }}>
        <div className="max-w-6xl mx-auto">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 opacity-60">
              <p className="text-lg">No items found in this category</p>
            </div>
          ) : (
            <div
              className={`
                grid gap-4
                ${activeFilter === 'image'
                  ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                  : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                }
              `}
            >
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
      </section>

      {/* Detail Modal */}
      <ResourceDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}
