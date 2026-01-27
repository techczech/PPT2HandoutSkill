import type {
  Presentation,
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
// URL Extraction - AI-only approach
// Links are extracted semantically by the AI during skill execution
// and stored in entities.json. No mechanical regex extraction.
// ==========================================


// ==========================================
// Entities from entities.json
// ==========================================

// Supports both old format (with mentions) and new format (direct fields)
interface PersonEntity {
  name: string;
  role?: string;
  slideIndex?: number;
  mentions?: { slideIndex: number; context: string }[];
}

interface OrgEntity {
  name: string;
  type?: string;
  description?: string;
  mentions?: { slideIndex: number; context: string }[];
}

interface QuoteEntity {
  text: string;
  attribution?: string;
  source?: string;
  slideIndex: number;
  topic?: string;
  extractedFromImage?: boolean;
}

interface ToolEntity {
  name: string;
  maker?: string;
  type?: string;
  description?: string;
  url?: string;
  category?: string;
  mentions?: { slideIndex: number; context: string }[];
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

interface LinkEntity {
  url: string;
  title?: string;
  description?: string;
  slideIndex?: number;
  linkType?: string;
}

interface EntitiesFile {
  people?: PersonEntity[];
  organizations?: OrgEntity[];
  quotes?: QuoteEntity[];
  tools?: ToolEntity[];
  terms?: TermEntity[];
  dates?: DateEntity[];
  images?: ImageEntity[];
  links?: LinkEntity[];
}

// ==========================================
// Main Extraction Function
// ==========================================

export function extractResources(presentation: Presentation): ExtractedResources {
  // Load entities from entities.json
  const entities = entitiesData as EntitiesFile;

  // Convert AI-extracted entities to the format expected by the UI
  // Supports both old format (with mentions) and new format (direct fields)

  // People
  const people: PersonResource[] = (entities.people || []).map(p => ({
    name: p.name,
    role: p.role,
    slideIndex: p.slideIndex ?? p.mentions?.[0]?.slideIndex ?? 0,
    context: p.role || p.mentions?.[0]?.context || '',
  }));

  // Organizations
  const organizations: OrganizationResource[] = (entities.organizations || []).map(o => ({
    name: o.name,
    slideIndex: o.mentions?.[0]?.slideIndex ?? 0,
    context: o.description || o.mentions?.[0]?.context || '',
  }));

  // Quotes (with topic support)
  const quotes: QuoteResource[] = (entities.quotes || []).map(q => ({
    text: q.text,
    attribution: q.attribution,
    slideIndex: q.slideIndex,
    slideTitle: q.attribution || q.source || '',
    topic: q.topic,
    extractedFromImage: q.extractedFromImage,
  }));

  // Tools
  const tools: ToolResource[] = (entities.tools || []).map(t => ({
    name: t.name,
    description: t.description || t.category || `${t.type || 'AI Tool'}${t.maker ? ` by ${t.maker}` : ''}`,
    url: t.url,
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

  // Links - Read ONLY from entities.json (AI-extracted with semantic understanding)
  // No mechanical regex extraction - links must be curated by AI during skill execution
  const links: LinkResource[] = (entities.links || []).map(link => {
    const cleanUrl = link.url.startsWith('http') ? link.url : `https://${link.url}`;
    return {
      url: cleanUrl,
      label: link.title || link.url.replace(/^https?:\/\//, '').split('/')[0],
      description: link.description,
      slideIndex: link.slideIndex,
      linkType: link.linkType,
    };
  });

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
    links,
  };
}
