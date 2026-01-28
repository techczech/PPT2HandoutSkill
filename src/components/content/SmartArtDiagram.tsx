import type { SmartArtContent, SmartArtNode } from '../../data/types';

interface SmartArtDiagramProps {
  content: SmartArtContent;
  fillSpace?: boolean;
  theme?: 'light' | 'dark';
}

// Check if layout is a horizontal numbered/process layout
function isHorizontalNumberedLayout(layout: string, nodes: SmartArtNode[]): boolean {
  const layoutLower = layout.toLowerCase();

  // Skip "action list" - that's a comparison layout, not a numbered process
  if (layoutLower.includes('action list')) {
    return false;
  }

  // Explicit process/numbered patterns
  if (layoutLower.includes('process') || layoutLower.includes('numbered')) {
    return true;
  }

  // Also detect by structure: has both number-only nodes (level 0) and content nodes (level 1)
  const hasNumberNodes = nodes.some(n => n.level === 0 && /^\d+$/.test(n.text.trim()));
  const hasContentNodes = nodes.some(n => n.level === 1 && n.children && n.children.length > 0);

  return hasNumberNodes && hasContentNodes;
}

// Check if layout is a horizontal icon layout (Icon Label Description List, etc.)
function isHorizontalIconLayout(layout: string): boolean {
  const layoutLower = layout.toLowerCase();
  // These layouts should render as horizontal icons with descriptions below
  const horizontalIconPatterns = [
    'icon label description',
    'icon label list',
    'icon circle label',
    'centered icon label',
  ];
  return horizontalIconPatterns.some(p => layoutLower.includes(p));
}

// Check if layout is a horizontal comparison/action list
function isHorizontalComparisonLayout(layout: string): boolean {
  const layoutLower = layout.toLowerCase();
  return layoutLower.includes('action list') || layoutLower.includes('comparison');
}

// Check if layout is a timeline (empty layout with time-related node text)
function isTimelineLayout(layout: string, nodes: SmartArtNode[]): boolean {
  // Only for empty/unknown layouts
  if (layout && layout.trim() !== '') {
    return false;
  }
  // Check if nodes have time-related keywords
  const timeKeywords = /\b(today|soon|long term|short term|now|future|past|later|immediate|next)\b/i;
  // Check for date patterns (months, years, seasons)
  const datePatterns = /\b(january|february|march|april|may|june|july|august|september|october|november|december|spring|summer|autumn|fall|winter|20\d{2}|19\d{2})\b/i;
  // Timeline if majority of nodes match time/date patterns
  const timeMatches = nodes.filter(n => timeKeywords.test(n.text) || datePatterns.test(n.text)).length;
  return timeMatches >= Math.ceil(nodes.length / 2);
}

// Check if layout is a pyramid/funnel (empty layout with level-related keywords)
function isPyramidLayout(layout: string, nodes: SmartArtNode[]): boolean {
  // Only for empty/unknown layouts
  if (layout && layout.trim() !== '') {
    return false;
  }
  // Check if nodes have level-related keywords and have children
  const levelKeywords = /\b(low|medium|high|basic|intermediate|advanced|tier|level)\b/i;
  const hasLevelKeywords = nodes.some(n => levelKeywords.test(n.text));
  const hasChildren = nodes.some(n => n.children && n.children.length > 0);
  return hasLevelKeywords && hasChildren;
}

// Check if layout is a stats display (empty layout with icons, no children, short numeric text)
function isStatsLayout(layout: string, nodes: SmartArtNode[]): boolean {
  // Only for empty/unknown layouts
  if (layout && layout.trim() !== '') {
    return false;
  }
  // Must have icons
  const hasIcons = nodes.some(n => n.icon);
  // No children
  const noChildren = nodes.every(n => !n.children || n.children.length === 0);
  // Short text (likely metrics/stats)
  const shortText = nodes.every(n => n.text.length < 30);
  // Contains numbers
  const hasNumbers = nodes.some(n => /\d/.test(n.text));

  return hasIcons && noChildren && shortText && hasNumbers;
}

// Check if layout is a tag grid (empty layout, many items, no icons, no children, SHORT text)
function isTagGridLayout(layout: string, nodes: SmartArtNode[]): boolean {
  // Only for empty/unknown layouts
  if (layout && layout.trim() !== '') {
    return false;
  }
  // Many items (6+)
  const manyItems = nodes.length >= 6;
  // No icons
  const noIcons = nodes.every(n => !n.icon);
  // No children
  const noChildren = nodes.every(n => !n.children || n.children.length === 0);
  // Short text (avg < 40 chars) - distinguishes tags from workflow steps
  const avgTextLength = nodes.reduce((sum, n) => sum + n.text.length, 0) / nodes.length;
  const shortText = avgTextLength < 40;

  return manyItems && noIcons && noChildren && shortText;
}

// Check if layout is an annotated grid (empty layout, 4-8 items with icons AND children)
function isAnnotatedGridLayout(layout: string, nodes: SmartArtNode[]): boolean {
  // Only for empty/unknown layouts
  if (layout && layout.trim() !== '') {
    return false;
  }
  // 4-8 items
  const rightCount = nodes.length >= 4 && nodes.length <= 8;
  // Has icons
  const hasIcons = nodes.some(n => n.icon);
  // Has children
  const hasChildren = nodes.some(n => n.children && n.children.length > 0);

  return rightCount && hasIcons && hasChildren;
}

// Check if layout is a vertical workflow (empty layout, 4+ steps, no icons, longer text, NO children)
// Workflows are sequential steps without sub-items. Items with children are vertical lists, not workflows.
function isVerticalWorkflowLayout(layout: string, nodes: SmartArtNode[]): boolean {
  // Only for empty/unknown layouts
  if (layout && layout.trim() !== '') {
    return false;
  }
  // 4+ sequential steps
  const enoughSteps = nodes.length >= 4;
  // No icons
  const noIcons = nodes.every(n => !n.icon);
  // Longer text (avg >= 40 chars)
  const avgTextLength = nodes.reduce((sum, n) => sum + n.text.length, 0) / nodes.length;
  const longerText = avgTextLength >= 40;
  // Must NOT have children — items with children are categorized lists, not workflows
  const hasChildren = nodes.some(n => n.children && n.children.length > 0);

  return enoughSteps && noIcons && longerText && !hasChildren;
}

// Check if layout is a vertical list-style (should be rendered as stacked cards)
function isVerticalListLayout(layout: string, nodes: SmartArtNode[]): boolean {
  const layoutLower = layout.toLowerCase();

  // Skip horizontal icon layouts - they should NOT be vertical
  if (isHorizontalIconLayout(layout)) {
    return false;
  }

  // Explicit vertical list patterns
  const verticalPatterns = ['vertical', 'stacked', 'solid'];
  if (verticalPatterns.some(p => layoutLower.includes(p))) {
    return true;
  }

  // If layout is empty/unknown but nodes are simple (no deep nesting), treat as list
  if (!layout || layout.trim() === '') {
    const isSimpleList = nodes.every(node =>
      !node.children || node.children.length === 0 ||
      node.children.every(child => !child.children || child.children.length === 0)
    );
    return isSimpleList;
  }

  return false;
}

// Horizontal numbered card for process/timeline layouts
interface NumberedCard {
  number: string;
  title: string;
  subtitle?: string;
}

function parseNumberedNodes(nodes: SmartArtNode[]): NumberedCard[] {
  // Separate number nodes from content nodes
  const numberNodes = nodes.filter(n => n.level === 0 && /^\d+$/.test(n.text.trim()));
  const contentNodes = nodes.filter(n => n.level === 1);

  // Sort numbers
  const sortedNumbers = [...numberNodes].sort((a, b) => parseInt(a.text) - parseInt(b.text));

  // Create cards by matching numbers with content
  // Content nodes may need sorting by their child times
  const cards: NumberedCard[] = [];

  // Try to match by parsing times from children
  const contentWithTimes = contentNodes.map(node => {
    const timeChild = node.children?.[0]?.text || '';
    // Extract start time for sorting (e.g., "10:30-12" -> 10.5, "1-2:15" -> 13)
    const timeMatch = timeChild.match(/^(\d+):?(\d*)[-–]/);
    let sortTime = 0;
    if (timeMatch) {
      const hours = parseInt(timeMatch[1]);
      const mins = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      // Assume PM for times < 8
      sortTime = (hours < 8 ? hours + 12 : hours) + mins / 60;
    }
    return { node, sortTime, timeChild };
  }).sort((a, b) => a.sortTime - b.sortTime);

  // Match sorted content with sorted numbers
  for (let i = 0; i < sortedNumbers.length && i < contentWithTimes.length; i++) {
    cards.push({
      number: sortedNumbers[i].text,
      title: contentWithTimes[i].node.text,
      subtitle: contentWithTimes[i].timeChild,
    });
  }

  return cards;
}

function HorizontalNumberedDiagram({ nodes }: { nodes: SmartArtNode[] }) {
  const cards = parseNumberedNodes(nodes);

  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
      <div
        className="py-4 px-6 mb-6"
        style={{ background: 'var(--color-primary)' }}
      >
        {/* Empty header or could show title */}
      </div>

      {/* Horizontal cards */}
      <div className="flex-1 flex gap-4 px-4 pb-4 overflow-x-auto">
        {cards.map((card, index) => (
          <div
            key={index}
            className="flex-1 min-w-[160px] max-w-[240px] bg-gray-200 rounded-lg p-4 flex flex-col items-center text-center"
          >
            {/* Number circle */}
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-4 text-2xl md:text-3xl font-bold text-white"
              style={{ background: 'var(--color-primary)' }}
            >
              {card.number}
            </div>
            {/* Title */}
            <h3
              className="text-base md:text-lg font-semibold mb-2"
              style={{ color: 'var(--color-primary)' }}
            >
              {card.title}
            </h3>
            {/* Subtitle/time */}
            {card.subtitle && (
              <p className="text-sm text-gray-600">• {card.subtitle}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Horizontal icon layout for Icon Label Description List, Icon Label List, etc.
function HorizontalIconDiagram({ nodes, showArrows = false }: { nodes: SmartArtNode[]; showArrows?: boolean }) {
  return (
    <div className="flex flex-col h-full w-full">
      {/* Horizontal icons container - fills available space */}
      <div className="flex-1 flex gap-4 md:gap-8 lg:gap-12 px-4 md:px-8 py-6 md:py-10 justify-center items-start">
        {nodes.map((node, index) => (
          <div
            key={node.id}
            className="flex-1 flex flex-col items-center text-center relative"
          >
            {/* Arrow connector to next item */}
            {showArrows && index < nodes.length - 1 && (
              <div
                className="absolute top-10 md:top-14 lg:top-16 -right-2 md:-right-4 lg:-right-6 text-2xl md:text-3xl font-bold z-10"
                style={{ color: 'var(--color-primary)' }}
              >
                →
              </div>
            )}
            {/* Icon - large and prominent, show in original colors */}
            {node.icon ? (
              <img
                src={node.icon}
                alt={node.icon_alt || ''}
                className="w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 object-contain mb-4 md:mb-6 rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div
                className="w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 mb-4 md:mb-6 rounded-lg"
                style={{ backgroundColor: 'var(--color-primary)' }}
              />
            )}
            {/* Title - large and bold */}
            <h3
              className="text-xl md:text-2xl lg:text-3xl font-bold mb-3 md:mb-4"
              style={{ color: 'var(--color-primary)' }}
            >
              {node.text}
            </h3>
            {/* Children as description lines - readable size */}
            {node.children && node.children.length > 0 && (
              <div className="text-base md:text-lg lg:text-xl text-gray-700 space-y-1 md:space-y-2">
                {node.children.map((child) => (
                  <div key={child.id}>{child.text}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Horizontal comparison layout for Action List (side-by-side comparison cards)
function HorizontalComparisonDiagram({ nodes }: { nodes: SmartArtNode[] }) {
  return (
    <div className="flex flex-col h-full w-full">
      {/* Side-by-side comparison cards */}
      <div className="flex-1 flex gap-6 md:gap-10 lg:gap-16 px-4 md:px-8 py-6 md:py-10 justify-center items-stretch">
        {nodes.map((node) => (
          <div
            key={node.id}
            className="flex-1 max-w-md bg-gray-100 rounded-xl p-6 md:p-8 flex flex-col"
          >
            {/* Title - centered and bold */}
            <h3
              className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 text-center"
              style={{ color: 'var(--color-primary)' }}
            >
              {node.text}
            </h3>
            {/* Children as comparison points */}
            {node.children && node.children.length > 0 && (
              <div className="flex-1 flex flex-col justify-center text-lg md:text-xl lg:text-2xl text-gray-700 space-y-2 text-center">
                {node.children.map((child) => (
                  <div key={child.id}>{child.text}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Horizontal timeline layout for time-based progressions
// Renders as a horizontal arrow with circles on it, content alternating above/below
function HorizontalTimeline({ nodes }: { nodes: SmartArtNode[] }) {
  return (
    <div className="flex flex-col h-full w-full px-2 md:px-6 py-6 justify-center">
      {/* Main timeline area with arrow and items */}
      <div className="relative" style={{ minHeight: '300px' }}>
        {/* Gray arrow background spanning full width */}
        <div className="absolute left-0 right-0" style={{ top: '50%', transform: 'translateY(-50%)' }}>
          <svg width="100%" height="48" viewBox="0 0 1000 48" preserveAspectRatio="none">
            <polygon
              points="0,8 960,8 960,0 1000,24 960,48 960,40 0,40"
              fill="#d1d5db"
            />
          </svg>
        </div>

        {/* Timeline items positioned along the arrow */}
        <div className="relative flex justify-between items-center" style={{ minHeight: '300px' }}>
          {nodes.map((node, index) => {
            const isAbove = index % 2 === 0;
            return (
              <div
                key={node.id}
                className="flex-1 flex flex-col items-center relative"
              >
                {/* Content card - above or below the line */}
                <div
                  className={`text-center px-2 ${isAbove ? 'mb-auto pb-4' : 'mt-auto pt-4'}`}
                  style={{ order: isAbove ? 0 : 2 }}
                >
                  <h3
                    className="text-sm md:text-base lg:text-lg font-bold mb-1"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {node.text}
                  </h3>
                  {node.children && node.children.length > 0 && (
                    <div className="text-xs md:text-sm text-gray-700 space-y-0.5">
                      {node.children.map((child) => (
                        <div key={child.id} className="flex items-start gap-1 justify-center">
                          <span style={{ color: 'var(--color-primary)' }}>•</span>
                          <span className="text-left">{child.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Circle marker on the arrow line */}
                <div
                  className="w-6 h-6 md:w-8 md:h-8 rounded-full z-10 shrink-0"
                  style={{ backgroundColor: 'var(--color-primary)', order: 1 }}
                />

                {/* Spacer for the opposite side */}
                <div
                  className={`flex-1 ${isAbove ? '' : ''}`}
                  style={{ order: isAbove ? 2 : 0, minHeight: '60px' }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Ascending arrow/growth curve layout for hierarchical levels
function PyramidDiagram({ nodes }: { nodes: SmartArtNode[] }) {
  // Sort nodes by level: low/basic first, high/advanced last (ascending)
  const levelOrder: Record<string, number> = {
    'low': 1, 'basic': 1,
    'medium': 2, 'intermediate': 2,
    'high': 3, 'advanced': 3,
  };

  const sortedNodes = [...nodes].sort((a, b) => {
    const aText = a.text.toLowerCase();
    const bText = b.text.toLowerCase();
    const aOrder = Object.entries(levelOrder).find(([k]) => aText.includes(k))?.[1] ?? 2;
    const bOrder = Object.entries(levelOrder).find(([k]) => bText.includes(k))?.[1] ?? 2;
    return aOrder - bOrder;
  });

  // Vertical offsets for ascending effect (higher index = higher position)
  const verticalOffsets = ['mt-32 md:mt-40', 'mt-16 md:mt-20', 'mt-0'];

  return (
    <div className="flex flex-col h-full w-full justify-end p-4 md:p-8">
      {/* Content columns */}
      <div className="flex justify-between items-end gap-4 md:gap-8 mb-4 relative z-10">
        {sortedNodes.map((node, index) => (
          <div
            key={node.id}
            className={`flex-1 flex flex-col items-start ${verticalOffsets[index] || ''}`}
          >
            {/* Circle marker */}
            <div
              className="w-8 h-8 md:w-10 md:h-10 rounded-full mb-2"
              style={{ background: 'var(--color-primary)' }}
            />
            {/* Title */}
            <h3
              className="text-xl md:text-2xl lg:text-3xl font-bold mb-2"
              style={{ color: 'var(--color-primary)' }}
            >
              {node.text}
            </h3>
            {/* Children as bullets */}
            {node.children && node.children.length > 0 && (
              <div className="text-base md:text-lg text-gray-700 space-y-1">
                {node.children.map((child) => (
                  <div key={child.id}>• {child.text}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Widening arrow/wedge at bottom */}
      <svg
        className="w-full h-16 md:h-24"
        viewBox="0 0 400 60"
        preserveAspectRatio="none"
      >
        <polygon
          points="0,60 0,55 400,0 400,60"
          fill="#d1d5db"
        />
      </svg>
    </div>
  );
}

// Stats display layout for metrics/numbers with icons
function StatsDisplayDiagram({ nodes }: { nodes: SmartArtNode[] }) {
  return (
    <div className="flex h-full w-full items-center justify-center p-4 md:p-8">
      <div className="flex gap-8 md:gap-16 lg:gap-24 justify-center items-start">
        {nodes.map((node) => {
          // Split text into number and label (e.g., "1000+ people" → "1000+" and "people")
          const match = node.text.match(/^([\d,]+\+?)\s*(.*)$/);
          const number = match ? match[1] : node.text;
          const label = match ? match[2] : '';

          return (
            <div key={node.id} className="flex flex-col items-center text-center">
              {/* Icon - show in original colors */}
              {node.icon && (
                <img
                  src={node.icon}
                  alt={node.icon_alt || ''}
                  className="w-16 h-16 md:w-24 md:h-24 lg:w-28 lg:h-28 object-contain mb-4 rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              {/* Number - large and bold */}
              <div
                className="text-3xl md:text-5xl lg:text-6xl font-bold"
                style={{ color: 'var(--color-primary)' }}
              >
                {number}
              </div>
              {/* Label */}
              {label && (
                <div className="text-lg md:text-xl lg:text-2xl text-gray-600 mt-1">
                  {label}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Tag grid layout for many simple items displayed as flowing tags
function TagGridDiagram({ nodes }: { nodes: SmartArtNode[] }) {
  return (
    <div className="flex h-full w-full items-center justify-center p-4 md:p-8">
      <div className="flex flex-wrap gap-3 md:gap-4 justify-center items-center max-w-4xl">
        {nodes.map((node) => (
          <div
            key={node.id}
            className="px-4 py-3 md:px-6 md:py-4 rounded-xl text-base md:text-lg lg:text-xl font-medium"
            style={{
              background: '#e5e7eb',
              color: 'var(--color-primary)',
            }}
          >
            {node.text}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * AnnotatedGridDiagram - Images with annotation cards in a responsive grid
 *
 * Usage: Display images/screenshots with descriptive annotation boxes below each.
 * All annotation boxes automatically match the height of the tallest one.
 *
 * Detection: Empty SmartArt layout + 4-8 items + has icons (images) + has children (annotations)
 *
 * Structure expected:
 * - node.icon: Path to image/screenshot (can be large images, not just icons)
 * - node.text: Title for the annotation card
 * - node.children[]: Bullet points for features/descriptions
 *
 * Visual layout:
 * ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
 * │   [image]   │  │   [image]   │  │   [image]   │
 * ├─────────────┤  ├─────────────┤  ├─────────────┤
 * │ Title       │  │ Title       │  │ Title       │
 * │ • bullet 1  │  │ • bullet 1  │  │ • bullet 1  │
 * │ • bullet 2  │  │ • bullet 2  │  │             │  ← boxes stretch to equal height
 * │             │  │             │  │             │
 * └─────────────┘  └─────────────┘  └─────────────┘
 *
 * Reusable for: Tool galleries, app showcases, feature comparisons with screenshots
 */
function AnnotatedGridDiagram({ nodes }: { nodes: SmartArtNode[] }) {
  // Calculate grid columns based on item count
  const cols = nodes.length <= 4 ? 2 : 3;

  return (
    <div className="flex h-full w-full items-center justify-center p-4 md:p-6">
      <div
        className="grid gap-4 md:gap-5 w-full max-w-6xl items-stretch"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {nodes.map((node) => (
          <div key={node.id} className="flex flex-col h-full">
            {/* Large image/screenshot - fixed aspect ratio container */}
            {node.icon && (
              <div className="w-full h-32 md:h-40 mb-2 overflow-hidden rounded-lg shadow-md">
                <img
                  src={node.icon}
                  alt={node.icon_alt || node.text}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLImageElement).parentElement!.style.display = 'none';
                  }}
                />
              </div>
            )}
            {/* Annotation card below image - flex-1 makes all cards equal height */}
            <div className="bg-gray-100 rounded-lg p-3 md:p-4 flex-1 flex flex-col">
              <h3
                className="text-base md:text-lg font-bold mb-1"
                style={{ color: 'var(--color-primary)' }}
              >
                {node.text}
              </h3>
              {/* Children as feature bullets */}
              {node.children && node.children.length > 0 && (
                <div className="text-sm text-gray-600 space-y-0.5">
                  {node.children.map((child) => (
                    <div key={child.id}>• {child.text}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * VerticalWorkflowDiagram - Sequential process steps with connecting arrows
 *
 * Detection: Empty layout + 4+ items + no icons + avg text >= 40 chars
 *
 * Visual layout:
 * ┌─────────────────────────────────────┐
 * │ Step 1: Description text            │
 * │   • optional child details          │
 * └─────────────────┬───────────────────┘
 *                   ▼
 * ┌─────────────────────────────────────┐
 * │ Step 2: Description text            │
 * └─────────────────┬───────────────────┘
 *                   ▼
 * ┌─────────────────────────────────────┐
 * │ Step 3: Description text            │
 * └─────────────────────────────────────┘
 */
function VerticalWorkflowDiagram({ nodes }: { nodes: SmartArtNode[] }) {
  return (
    <div className="flex h-full w-full items-center justify-center p-4 md:p-6">
      <div className="flex flex-col items-center w-full max-w-2xl">
        {nodes.map((node, index) => (
          <div key={node.id} className="w-full flex flex-col items-center">
            {/* Step box - light gray background like other SmartArt */}
            <div
              className="w-full rounded-lg p-4 md:p-5 text-center"
              style={{ background: '#e5e7eb' }}
            >
              <div
                className="text-base md:text-lg font-medium"
                style={{ color: 'var(--color-primary)' }}
              >
                {node.text}
              </div>
              {/* Children as sub-details */}
              {node.children && node.children.length > 0 && (
                <div className="text-sm text-gray-600 mt-2 space-y-1">
                  {node.children.map((child) => (
                    <div key={child.id}>• {child.text}</div>
                  ))}
                </div>
              )}
            </div>
            {/* Arrow connector (except after last item) */}
            {index < nodes.length - 1 && (
              <div
                className="text-3xl my-2"
                style={{ color: 'var(--color-primary)' }}
              >
                ▼
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Grouped card component for list-style layouts (like Icon Vertical Solid List)
function GroupedCardNode({ node, fillSpace, theme = 'light' }: { node: SmartArtNode; fillSpace?: boolean; theme?: 'light' | 'dark' }) {
  // On dark background, use lighter card styling; on light background, use gray cards with dark text
  const isDark = theme === 'dark';
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div
      className={`rounded-xl p-4 md:p-6 flex items-center gap-4 md:gap-6 w-full ${fillSpace ? 'flex-1' : ''}`}
      style={{
        background: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb', // gray-200 for light theme
        border: isDark ? '1px solid rgba(255,255,255,0.2)' : 'none',
      }}
    >
      {/* Icon - show in original colors (for real logo images) */}
      {node.icon && (
        <img
          src={node.icon}
          alt={node.icon_alt || ''}
          className="w-14 h-14 md:w-16 md:h-16 object-contain shrink-0 rounded-lg"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}
      {/* Title - takes up space, children go to the right */}
      <h3
        className={`text-xl md:text-2xl font-semibold ${hasChildren ? 'flex-1 min-w-0' : ''}`}
        style={{ color: isDark ? 'white' : 'var(--color-primary)' }}
      >
        {node.text}
      </h3>
      {/* Children as list to the right of title - wraps text */}
      {hasChildren && (
        <div
          className="text-base md:text-lg max-w-[40%]"
          style={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#4b5563' }} // gray-600 for light
        >
          {node.children!.map((child) => (
            <div key={child.id}>{child.text}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// Default node component for other layouts
function SmartArtNodeComponent({ node, depth = 0 }: { node: SmartArtNode; depth?: number }) {
  const indentClass = depth > 0 ? 'ml-4' : '';
  const bgClasses = [
    'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300',
    'bg-gradient-to-r from-green-50 to-green-100 border-green-300',
    'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-300',
    'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-300',
  ];
  const bgClass = bgClasses[depth % bgClasses.length];

  return (
    <div className={`${indentClass} space-y-2`}>
      <div className={`smart-art-node ${bgClass} border-l-4`}>
        {node.icon && (
          <img
            src={node.icon}
            alt={node.icon_alt || ''}
            className="w-8 h-8 object-contain shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
        <div className="flex-1">
          {node.text.split('\n').map((line, i) => (
            <p key={i} className={i === 0 ? 'font-medium text-gray-900' : 'text-sm text-gray-600'}>
              {line}
            </p>
          ))}
        </div>
      </div>
      {node.children && node.children.length > 0 && (
        <div className="space-y-2">
          {node.children.map((child) => (
            <SmartArtNodeComponent key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SmartArtDiagram({ content, fillSpace = false, theme = 'light' }: SmartArtDiagramProps) {
  if (!content.nodes || content.nodes.length === 0) {
    return null;
  }

  // Check for horizontal numbered/process layouts first
  if (isHorizontalNumberedLayout(content.layout, content.nodes)) {
    return <HorizontalNumberedDiagram nodes={content.nodes} />;
  }

  // Check for horizontal icon layouts (Icon Label Description List, etc.)
  if (isHorizontalIconLayout(content.layout)) {
    return <HorizontalIconDiagram nodes={content.nodes} />;
  }

  // Check for horizontal comparison/action list layouts
  if (isHorizontalComparisonLayout(content.layout)) {
    return <HorizontalComparisonDiagram nodes={content.nodes} />;
  }

  // Check for timeline layouts (empty layout with time keywords)
  if (isTimelineLayout(content.layout, content.nodes)) {
    return <HorizontalTimeline nodes={content.nodes} />;
  }

  // Check for pyramid/funnel layouts (empty layout with level keywords)
  if (isPyramidLayout(content.layout, content.nodes)) {
    return <PyramidDiagram nodes={content.nodes} />;
  }

  // Check for stats display layouts (empty layout with icons, numbers, no children)
  if (isStatsLayout(content.layout, content.nodes)) {
    return <StatsDisplayDiagram nodes={content.nodes} />;
  }

  // Empty layout with icons and no children → horizontal icon layout with arrows (sequence)
  if ((!content.layout || content.layout.trim() === '') &&
      content.nodes.some(n => n.icon) &&
      content.nodes.every(n => !n.children || n.children.length === 0)) {
    return <HorizontalIconDiagram nodes={content.nodes} showArrows={true} />;
  }

  // Check for tag grid layouts (empty layout, many items, no icons, no children)
  if (isTagGridLayout(content.layout, content.nodes)) {
    return <TagGridDiagram nodes={content.nodes} />;
  }

  // Check for annotated grid layouts (empty layout, 4-8 items with icons and children)
  if (isAnnotatedGridLayout(content.layout, content.nodes)) {
    return <AnnotatedGridDiagram nodes={content.nodes} />;
  }

  // Check for vertical workflow layouts (empty layout, 4+ steps, no icons, longer text)
  if (isVerticalWorkflowLayout(content.layout, content.nodes)) {
    return <VerticalWorkflowDiagram nodes={content.nodes} />;
  }

  // Use grouped cards for vertical list-style layouts
  if (isVerticalListLayout(content.layout, content.nodes)) {
    return (
      <div className={`flex flex-col gap-3 ${fillSpace ? 'h-full' : ''}`}>
        {content.nodes.map((node) => (
          <GroupedCardNode key={node.id} node={node} fillSpace={fillSpace} theme={theme} />
        ))}
      </div>
    );
  }

  // Default rendering for other layouts
  return (
    <div className={`flex flex-col gap-3 ${fillSpace ? 'h-full' : ''}`}>
      {content.nodes.map((node) => (
        <SmartArtNodeComponent key={node.id} node={node} />
      ))}
    </div>
  );
}
