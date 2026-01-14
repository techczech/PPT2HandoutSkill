import type {
  Presentation,
  ContentBlock,
  SmartArtNode,
  ImageContent,
  ExtractedResources,
  PersonResource,
  OrganizationResource,
  PlaceResource,
  DateResource,
  QuoteResource,
  ImageResource,
  ToolResource,
  TermResource,
  LinkResource,
} from '../data/types';

// Import entities.json if it exists
import entitiesData from '../data/entities.json';

// ==========================================
// URL Extraction (Keep mechanical for unambiguous URLs)
// ==========================================

const COMMON_TLDS = 'com|org|net|io|edu|gov|co|uk|de|fr|it|es|nl|be|ch|at|ai|dev|app|tech|info|biz';
const URL_PATTERN = new RegExp(
  `(?:https?:\\/\\/[^\\s)]+|www\\.[a-zA-Z0-9-]+\\.[a-zA-Z]{2,}(?:\\/[^\\s)]*)?|[a-zA-Z0-9-]+\\.(?:${COMMON_TLDS})(?:\\/[^\\s)]*)?)`,
  'gi'
);
const SHORTLINK_PATTERN = /(?:bit\.ly|linktr\.ee|tinyurl\.com|t\.co|goo\.gl|youtu\.be)\/[a-zA-Z0-9-_]+/gi;

// ==========================================
// Helper Functions
// ==========================================

function extractTextFromContent(content: ContentBlock[]): string[] {
  const texts: string[] = [];

  for (const block of content) {
    switch (block.type) {
      case 'heading':
        texts.push(block.text);
        break;
      case 'list':
        for (const item of block.items) {
          texts.push(item.text);
          if (item.children) {
            for (const child of item.children) {
              texts.push(child.text);
              if (child.children) {
                for (const grandchild of child.children) {
                  texts.push(grandchild.text);
                }
              }
            }
          }
        }
        break;
      case 'smart_art':
        const extractNodes = (nodes: SmartArtNode[]) => {
          for (const node of nodes) {
            texts.push(node.text);
            if (node.children) extractNodes(node.children);
          }
        };
        extractNodes(block.nodes);
        break;
    }
  }

  return texts;
}

// ==========================================
// Entities from entities.json
// ==========================================

interface EntityMention {
  slideIndex: number;
  context: string;
}

interface PersonEntity {
  name: string;
  role?: string;
  mentions: EntityMention[];
}

interface OrgEntity {
  name: string;
  type?: string;
  mentions: EntityMention[];
}

interface QuoteEntity {
  text: string;
  attribution?: string;
  source?: string;
  slideIndex: number;
}

interface ToolEntity {
  name: string;
  maker?: string;
  type?: string;
  mentions: EntityMention[];
}

interface TermEntity {
  term: string;
  definition?: string;
  slideIndex?: number;
}

interface DateEntity {
  date: string;
  event: string;
  significance?: string;
  slideIndex: number;
}

interface ImageEntity {
  src: string;
  description: string;
  slideIndex: number;
  containsQuote?: boolean;
  quoteIndex?: number;
}

interface EntitiesFile {
  people?: PersonEntity[];
  organizations?: OrgEntity[];
  quotes?: QuoteEntity[];
  tools?: ToolEntity[];
  terms?: TermEntity[];
  dates?: DateEntity[];
  images?: ImageEntity[];
}

// ==========================================
// Main Extraction Function
// ==========================================

export function extractResources(presentation: Presentation): ExtractedResources {
  // Load entities from entities.json
  const entities = entitiesData as EntitiesFile;

  // Convert AI-extracted entities to the format expected by the UI

  // People
  const people: PersonResource[] = (entities.people || []).map(p => ({
    name: p.name,
    role: p.role,
    slideIndex: p.mentions[0]?.slideIndex ?? 0,
    context: p.mentions[0]?.context ?? '',
  }));

  // Organizations
  const organizations: OrganizationResource[] = (entities.organizations || []).map(o => ({
    name: o.name,
    slideIndex: o.mentions[0]?.slideIndex ?? 0,
    context: o.mentions[0]?.context ?? '',
  }));

  // Quotes
  const quotes: QuoteResource[] = (entities.quotes || []).map(q => ({
    text: q.text,
    attribution: q.attribution,
    slideIndex: q.slideIndex,
    slideTitle: q.source || '',
  }));

  // Tools
  const tools: ToolResource[] = (entities.tools || []).map(t => ({
    name: t.name,
    description: `${t.type || 'AI Tool'}${t.maker ? ` by ${t.maker}` : ''}`,
  }));

  // Terms
  const terms: TermResource[] = (entities.terms || []).map(t => ({
    term: t.term,
    context: t.definition || '',
  }));

  // Dates
  const dates: DateResource[] = (entities.dates || []).map(d => ({
    raw: d.date,
    formatted: d.date,
    year: parseInt(d.date.match(/\d{4}/)?.[0] || '0'),
    slideIndex: d.slideIndex,
    context: d.event,
  })).sort((a, b) => (b.year || 0) - (a.year || 0));

  // Images - Get from presentation data (keep comprehensive list)
  const images: ImageResource[] = [];
  let globalSlideIndex = 0;

  for (const section of presentation.sections) {
    for (const slide of section.slides) {
      const slideIndex = globalSlideIndex++;

      for (const block of slide.content) {
        if (block.type === 'image') {
          const img = block as ImageContent;

          // Find enhanced description from entities.json
          const entityImage = (entities.images || []).find(ei => ei.src === img.src);

          images.push({
            src: img.src,
            alt: img.alt,
            caption: img.caption,
            description: entityImage?.description || img.description,
            slideIndex,
            slideTitle: slide.title,
            sectionTitle: section.title,
          });
        }
      }
    }
  }

  // Links - Extract mechanically (URLs are unambiguous)
  const foundLinks = new Map<string, LinkResource>();
  globalSlideIndex = 0;

  for (const section of presentation.sections) {
    for (const slide of section.slides) {
      const slideIndex = globalSlideIndex++;
      const slideTexts = [slide.title, slide.notes, ...extractTextFromContent(slide.content)];
      const slideText = slideTexts.join(' ');

      const urlMatches = slideText.match(URL_PATTERN) || [];
      const shortlinkMatches = slideText.match(SHORTLINK_PATTERN) || [];

      for (const url of [...urlMatches, ...shortlinkMatches]) {
        const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
        const domain = url.replace(/^https?:\/\//, '').split('/')[0];

        // Skip common non-resource URLs
        if (domain.includes('example.com') || domain.includes('localhost')) continue;

        if (!foundLinks.has(cleanUrl.toLowerCase())) {
          foundLinks.set(cleanUrl.toLowerCase(), {
            url: cleanUrl,
            label: domain,
            slideIndex,
          });
        }
      }
    }
  }

  // Places - Not currently in entities.json, leave empty for now
  const places: PlaceResource[] = [];

  return {
    people,
    organizations,
    places,
    dates,
    quotes,
    images,
    tools,
    terms,
    links: Array.from(foundLinks.values()),
  };
}
