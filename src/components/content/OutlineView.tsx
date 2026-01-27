import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import presentationData from '../../data/presentation.json';
import type { Section, Slide, ContentBlock, ListContent, ListItem } from '../../data/types';

interface OutlineViewProps {
  currentSlideIndex: number;
}

interface OutlineNode {
  type: 'section' | 'subsection' | 'slide' | 'content' | 'subitem';
  text: string;
  slideIndex?: number;
  children?: OutlineNode[];
  metadata?: {
    layout?: string;
    contentType?: string;
  };
}

// Check if a slide acts as a subsection header
function isSubsectionSlide(slide: Slide): boolean {
  const layout = slide.layout.toLowerCase();
  return (
    layout.includes('section heading') ||
    (layout.includes('title only') && !slide.content.some(c => c.type !== 'heading'))
  );
}

// Extract text content from a content block
function extractContentText(content: ContentBlock): OutlineNode[] {
  const nodes: OutlineNode[] = [];

  switch (content.type) {
    case 'list': {
      const listContent = content as ListContent;
      listContent.items.forEach((item: ListItem) => {
        const itemNode: OutlineNode = {
          type: 'content',
          text: item.text,
          metadata: { contentType: 'list-item' },
        };
        if (item.children && item.children.length > 0) {
          itemNode.children = item.children.map((child: ListItem) => ({
            type: 'subitem' as const,
            text: child.text,
          }));
        }
        nodes.push(itemNode);
      });
      break;
    }
    case 'image': {
      if (content.description || content.alt) {
        nodes.push({
          type: 'content',
          text: content.description || content.alt || 'Image',
          metadata: { contentType: 'image' },
        });
      }
      if (content.quote_text) {
        nodes.push({
          type: 'content',
          text: `"${content.quote_text}"${content.quote_attribution ? ` — ${content.quote_attribution}` : ''}`,
          metadata: { contentType: 'quote-from-image' },
        });
      }
      break;
    }
    case 'smart_art': {
      content.nodes.forEach(node => {
        if (node.text && !/^\d+$/.test(node.text.trim())) {
          const smartNode: OutlineNode = {
            type: 'content',
            text: node.text,
            metadata: { contentType: 'smartart' },
          };
          if (node.children && node.children.length > 0) {
            smartNode.children = node.children.map(child => ({
              type: 'subitem' as const,
              text: child.text,
            }));
          }
          nodes.push(smartNode);
        }
      });
      break;
    }
    case 'video': {
      if (content.title) {
        nodes.push({
          type: 'content',
          text: `Video: ${content.title}`,
          metadata: { contentType: 'video' },
        });
      }
      break;
    }
  }

  return nodes;
}

// Build the outline tree from presentation data
function buildOutline(sections: Section[]): OutlineNode[] {
  const outline: OutlineNode[] = [];
  let globalSlideIndex = 0;

  sections.forEach((section) => {
    const sectionNode: OutlineNode = {
      type: 'section',
      text: section.title,
      children: [],
    };

    let currentSubsection: OutlineNode | null = null;

    section.slides.forEach((slide) => {
      const slideIndex = globalSlideIndex++;

      if (isSubsectionSlide(slide)) {
        currentSubsection = {
          type: 'subsection',
          text: slide.title,
          slideIndex,
          children: [],
          metadata: { layout: slide.layout },
        };
        sectionNode.children!.push(currentSubsection);
      } else {
        const slideNode: OutlineNode = {
          type: 'slide',
          text: slide.title,
          slideIndex,
          children: [],
          metadata: { layout: slide.layout },
        };

        slide.content
          .filter(c => c.type !== 'heading')
          .forEach(content => {
            const contentNodes = extractContentText(content);
            slideNode.children!.push(...contentNodes);
          });

        if (currentSubsection) {
          currentSubsection.children!.push(slideNode);
        } else {
          sectionNode.children!.push(slideNode);
        }
      }
    });

    outline.push(sectionNode);
  });

  return outline;
}

// Recursive outline node renderer
function OutlineNodeView({
  node,
  depth = 0,
  currentSlideIndex,
  onNavigate
}: {
  node: OutlineNode;
  depth?: number;
  currentSlideIndex: number;
  onNavigate: (index: number) => void;
}) {
  const isCurrentSlide = node.slideIndex === currentSlideIndex;
  const containsCurrentSlide = node.children?.some(child =>
    child.slideIndex === currentSlideIndex ||
    child.children?.some(grandchild => grandchild.slideIndex === currentSlideIndex)
  );

  const [expanded, setExpanded] = useState(depth < 1 || containsCurrentSlide || isCurrentSlide);
  const nodeRef = useRef<HTMLDivElement>(null);

  // Auto-expand and scroll when current slide is in this branch
  useEffect(() => {
    if (containsCurrentSlide || isCurrentSlide) {
      setExpanded(true);
    }
    if (isCurrentSlide && nodeRef.current) {
      nodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentSlideIndex, containsCurrentSlide, isCurrentSlide]);

  const hasChildren = node.children && node.children.length > 0;
  const indent = depth * 16;

  const typeStyles: Record<string, string> = {
    section: 'text-lg font-bold border-b border-gray-200 pb-1 mb-1',
    subsection: 'text-base font-semibold border-l-2 border-blue-400 pl-2',
    slide: 'font-medium',
    content: 'text-sm text-gray-600',
    subitem: 'text-xs text-gray-500',
  };

  const getTypeColor = (type: string) => {
    if (type === 'section' || type === 'subsection') return 'var(--color-primary)';
    return 'inherit';
  };

  return (
    <div ref={isCurrentSlide ? nodeRef : undefined} style={{ marginLeft: indent }} className="my-0.5">
      <div
        className={`flex items-start gap-1 py-0.5 px-1 rounded ${
          isCurrentSlide ? 'bg-blue-100 ring-2 ring-blue-400' : ''
        }`}
      >
        {hasChildren && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 shrink-0 mt-0.5 text-xs"
          >
            {expanded ? '▼' : '▶'}
          </button>
        )}
        {!hasChildren && <span className="w-4 shrink-0" />}

        {node.slideIndex !== undefined ? (
          <button
            onClick={() => onNavigate(node.slideIndex!)}
            className={`${typeStyles[node.type]} hover:underline text-left flex-1`}
            style={{ color: getTypeColor(node.type) }}
          >
            <span className="text-gray-400 text-xs mr-1">{node.slideIndex + 1}.</span>
            {node.text}
          </button>
        ) : (
          <span className={`${typeStyles[node.type]} flex-1`} style={{ color: getTypeColor(node.type) }}>
            {node.text}
          </span>
        )}
      </div>

      {expanded && hasChildren && (
        <div>
          {node.children!.map((child, i) => (
            <OutlineNodeView
              key={i}
              node={child}
              depth={depth + 1}
              currentSlideIndex={currentSlideIndex}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OutlineView({ currentSlideIndex }: OutlineViewProps) {
  const navigate = useNavigate();
  const outline = buildOutline(presentationData.sections as Section[]);

  const handleNavigate = (slideIndex: number) => {
    navigate(`/slides/${slideIndex + 1}`);
  };

  return (
    <div className="h-full overflow-auto p-4 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs text-gray-500 mb-3">
          Click on any slide to navigate. Current slide is highlighted.
        </p>
        {outline.map((section, i) => (
          <OutlineNodeView
            key={i}
            node={section}
            depth={0}
            currentSlideIndex={currentSlideIndex}
            onNavigate={handleNavigate}
          />
        ))}
      </div>
    </div>
  );
}
