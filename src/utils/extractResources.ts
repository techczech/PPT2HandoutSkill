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

// ==========================================
// Known Entities Lists
// ==========================================

const KNOWN_TOOLS = [
  { pattern: /google ai studio/i, name: 'Google AI Studio', description: 'Free AI development environment from Google' },
  { pattern: /gemini/i, name: 'Gemini', description: 'Google\'s multimodal AI model' },
  { pattern: /\bclaude\b/i, name: 'Claude', description: 'Anthropic\'s AI assistant' },
  { pattern: /chatgpt/i, name: 'ChatGPT', description: 'OpenAI\'s conversational AI' },
  { pattern: /lovable/i, name: 'Lovable.dev', description: 'AI-powered web app builder' },
  { pattern: /replit/i, name: 'Replit', description: 'Browser-based coding environment' },
  { pattern: /v0\.dev|v0 by vercel/i, name: 'v0.dev', description: 'AI UI component generator by Vercel' },
  { pattern: /\bcursor\b/i, name: 'Cursor', description: 'AI-powered code editor' },
  { pattern: /github copilot/i, name: 'GitHub Copilot', description: 'AI pair programmer' },
  { pattern: /bolt\.new/i, name: 'Bolt.new', description: 'AI-powered full-stack app builder' },
  { pattern: /windsurf/i, name: 'Windsurf', description: 'AI coding IDE by Codeium' },
  { pattern: /gpt-4o?/i, name: 'GPT-4', description: 'OpenAI\'s flagship language model' },
  { pattern: /dall-?e/i, name: 'DALL-E', description: 'OpenAI\'s image generation model' },
  { pattern: /midjourney/i, name: 'Midjourney', description: 'AI image generation service' },
  { pattern: /stable diffusion/i, name: 'Stable Diffusion', description: 'Open-source image generation model' },
  { pattern: /sora\b/i, name: 'Sora', description: 'OpenAI\'s video generation model' },
  { pattern: /perplexity/i, name: 'Perplexity', description: 'AI-powered search engine' },
  { pattern: /copilot/i, name: 'Copilot', description: 'Microsoft\'s AI assistant' },
  { pattern: /notion ai/i, name: 'Notion AI', description: 'AI writing assistant in Notion' },
];

const KEY_TERMS = [
  { pattern: /vibe\s*coding|vibecoding/i, term: 'Vibecoding', context: 'AI-assisted coding where you describe what you want in natural language' },
  { pattern: /\bllm\b/i, term: 'LLM', context: 'Large Language Model - AI models trained on text data' },
  { pattern: /prompt engineering/i, term: 'Prompt Engineering', context: 'Crafting effective instructions for AI models' },
  { pattern: /zero[- ]shot/i, term: 'Zero-shot', context: 'AI completing tasks without specific examples' },
  { pattern: /few[- ]shot/i, term: 'Few-shot', context: 'AI learning from a few examples in the prompt' },
  { pattern: /hallucination/i, term: 'Hallucination', context: 'When AI generates plausible but incorrect information' },
  { pattern: /\btoken\b/i, term: 'Token', context: 'Basic units of text that AI models process' },
  { pattern: /\bapi\b/i, term: 'API', context: 'Application Programming Interface - how programs communicate' },
  { pattern: /agentic/i, term: 'Agentic AI', context: 'AI systems that can take autonomous actions' },
  { pattern: /rag\b/i, term: 'RAG', context: 'Retrieval-Augmented Generation - combining AI with external knowledge' },
  { pattern: /fine[- ]?tuning/i, term: 'Fine-tuning', context: 'Training AI models on specific data' },
  { pattern: /context window/i, term: 'Context Window', context: 'Amount of text an AI can process at once' },
  { pattern: /multimodal/i, term: 'Multimodal', context: 'AI that can process multiple types of input (text, images, etc.)' },
  { pattern: /embedding/i, term: 'Embedding', context: 'Numerical representation of text for AI processing' },
];

const KNOWN_ORGANIZATIONS = [
  { pattern: /\bopenai\b/i, name: 'OpenAI' },
  { pattern: /\bgoogle\b/i, name: 'Google' },
  { pattern: /\bmicrosoft\b/i, name: 'Microsoft' },
  { pattern: /\banthropic\b/i, name: 'Anthropic' },
  { pattern: /\bmeta\b/i, name: 'Meta' },
  { pattern: /\bamazon\b/i, name: 'Amazon' },
  { pattern: /\bapple\b/i, name: 'Apple' },
  { pattern: /\bnvidia\b/i, name: 'Nvidia' },
  { pattern: /\bwalmart\b/i, name: 'Walmart' },
  { pattern: /\bdeepseek\b/i, name: 'DeepSeek' },
  { pattern: /\bmistral\b/i, name: 'Mistral' },
  { pattern: /\bcohere\b/i, name: 'Cohere' },
  { pattern: /\bhugging\s*face\b/i, name: 'Hugging Face' },
  { pattern: /\bstability\s*ai\b/i, name: 'Stability AI' },
  { pattern: /\bperplexity\s*ai\b/i, name: 'Perplexity AI' },
  { pattern: /\bvercel\b/i, name: 'Vercel' },
  { pattern: /\bx\.ai\b|xai\b/i, name: 'xAI' },
  { pattern: /\btesla\b/i, name: 'Tesla' },
  { pattern: /\bibm\b/i, name: 'IBM' },
  { pattern: /\bsalesforce\b/i, name: 'Salesforce' },
];

const KNOWN_PLACES = [
  // Countries
  { pattern: /\bunited states\b|\busa\b|\bu\.s\./i, name: 'United States', type: 'country' as const },
  { pattern: /\bchina\b/i, name: 'China', type: 'country' as const },
  { pattern: /\bjapan\b/i, name: 'Japan', type: 'country' as const },
  { pattern: /\bgermany\b/i, name: 'Germany', type: 'country' as const },
  { pattern: /\buk\b|\bunited kingdom\b|\bbritain\b/i, name: 'United Kingdom', type: 'country' as const },
  { pattern: /\bfrance\b/i, name: 'France', type: 'country' as const },
  { pattern: /\bcanada\b/i, name: 'Canada', type: 'country' as const },
  // Cities
  { pattern: /\bsan francisco\b/i, name: 'San Francisco', type: 'city' as const },
  { pattern: /\bnew york\b/i, name: 'New York', type: 'city' as const },
  { pattern: /\blondon\b/i, name: 'London', type: 'city' as const },
  { pattern: /\bseattle\b/i, name: 'Seattle', type: 'city' as const },
  { pattern: /\bbeijing\b/i, name: 'Beijing', type: 'city' as const },
  { pattern: /\bshanghai\b/i, name: 'Shanghai', type: 'city' as const },
  { pattern: /\btokyo\b/i, name: 'Tokyo', type: 'city' as const },
  { pattern: /\bsilicon valley\b/i, name: 'Silicon Valley', type: 'region' as const },
];

// Role patterns for people extraction
const ROLE_PATTERNS = [
  'CEO', 'CTO', 'CFO', 'COO', 'CMO',
  'President', 'Vice President', 'VP',
  'Director', 'Manager', 'Head of',
  'Founder', 'Co-founder', 'Co-Founder',
  'Chief', 'Engineer', 'Researcher',
  'Professor', 'Dr\\.', 'PhD',
];

// ==========================================
// Regex Patterns
// ==========================================

// URL pattern - strict to avoid false positives like "dominik.lukes"
// Only match: explicit http(s)://, www. prefix, or common TLDs
const COMMON_TLDS = 'com|org|net|io|edu|gov|co|uk|de|fr|it|es|nl|be|ch|at|ai|dev|app|tech|info|biz';
const URL_PATTERN = new RegExp(
  `(?:https?:\\/\\/[^\\s)]+|www\\.[a-zA-Z0-9-]+\\.[a-zA-Z]{2,}(?:\\/[^\\s)]*)?|[a-zA-Z0-9-]+\\.(?:${COMMON_TLDS})(?:\\/[^\\s)]*)?)`,
  'gi'
);
const SHORTLINK_PATTERN = /(?:bit\.ly|linktr\.ee|tinyurl\.com|t\.co|goo\.gl|youtu\.be)\/[a-zA-Z0-9-_]+/gi;

// Date patterns
const MONTH_YEAR_PATTERN = /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{4})\b/gi;
const FULL_DATE_PATTERN = /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2}),?\s+(\d{4})\b/gi;
const QUARTER_PATTERN = /\bQ([1-4])\s+(\d{4})\b/gi;

// Quote patterns
const QUOTE_PATTERN = /"([^"]{20,})"/g;
const SINGLE_QUOTE_PATTERN = /'([^']{20,})'/g;

// Person pattern: "Name Name, Role" or "Name Name (Role)"
const PERSON_PATTERN = new RegExp(
  `([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)+)(?:,|\\s*\\()\\s*(${ROLE_PATTERNS.join('|')})`,
  'g'
);

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

function formatMonth(month: string): string {
  const monthMap: Record<string, string> = {
    'jan': 'January', 'january': 'January',
    'feb': 'February', 'february': 'February',
    'mar': 'March', 'march': 'March',
    'apr': 'April', 'april': 'April',
    'may': 'May',
    'jun': 'June', 'june': 'June',
    'jul': 'July', 'july': 'July',
    'aug': 'August', 'august': 'August',
    'sep': 'September', 'sept': 'September', 'september': 'September',
    'oct': 'October', 'october': 'October',
    'nov': 'November', 'november': 'November',
    'dec': 'December', 'december': 'December',
  };
  return monthMap[month.toLowerCase()] || month;
}

// ==========================================
// Main Extraction Function
// ==========================================

export function extractResources(presentation: Presentation): ExtractedResources {
  const foundTools = new Map<string, ToolResource>();
  const foundLinks = new Map<string, LinkResource>();
  const foundTerms = new Map<string, TermResource>();
  const foundPeople = new Map<string, PersonResource>();
  const foundOrgs = new Map<string, OrganizationResource>();
  const foundPlaces = new Map<string, PlaceResource>();
  const foundDates = new Map<string, DateResource>();
  const foundQuotes = new Map<string, QuoteResource>();
  const foundImages: ImageResource[] = [];

  let globalSlideIndex = 0;

  // Process each slide
  for (const section of presentation.sections) {
    for (const slide of section.slides) {
      const slideIndex = globalSlideIndex++;
      const slideTexts = [slide.title, slide.notes, ...extractTextFromContent(slide.content)];
      const slideText = slideTexts.join(' ');

      // Extract images from this slide (and quotes from images)
      for (const block of slide.content) {
        if (block.type === 'image') {
          const img = block as ImageContent;
          foundImages.push({
            src: img.src,
            alt: img.alt,
            caption: img.caption,
            description: img.description,
            slideIndex,
            slideTitle: slide.title,
            sectionTitle: section.title,
          });

          // Extract quotes from images (tweets, messages, etc.)
          if (img.quote_text && img.quote_text.length > 10) {
            foundQuotes.set(img.quote_text.substring(0, 50), {
              text: img.quote_text,
              attribution: img.quote_attribution,
              slideIndex,
              slideTitle: slide.title,
            });
          }
        }
      }

      // Extract quotes from this slide
      // Check if it's a quote slide layout
      if (slide.layout.toLowerCase().includes('quote')) {
        const headingBlock = slide.content.find(b => b.type === 'heading');
        if (headingBlock && headingBlock.type === 'heading') {
          const quoteText = headingBlock.text;
          if (quoteText.length > 20) {
            foundQuotes.set(quoteText.substring(0, 50), {
              text: quoteText,
              attribution: slide.title,
              slideIndex,
              slideTitle: slide.title,
            });
          }
        }
      }

      // Extract quoted text
      let quoteMatch;
      QUOTE_PATTERN.lastIndex = 0;
      while ((quoteMatch = QUOTE_PATTERN.exec(slideText)) !== null) {
        const quoteText = quoteMatch[1];
        foundQuotes.set(quoteText.substring(0, 50), {
          text: quoteText,
          slideIndex,
          slideTitle: slide.title,
        });
      }

      SINGLE_QUOTE_PATTERN.lastIndex = 0;
      while ((quoteMatch = SINGLE_QUOTE_PATTERN.exec(slideText)) !== null) {
        const quoteText = quoteMatch[1];
        foundQuotes.set(quoteText.substring(0, 50), {
          text: quoteText,
          slideIndex,
          slideTitle: slide.title,
        });
      }

      // Extract people
      PERSON_PATTERN.lastIndex = 0;
      let personMatch;
      while ((personMatch = PERSON_PATTERN.exec(slideText)) !== null) {
        const name = personMatch[1];
        const role = personMatch[2];
        foundPeople.set(name.toLowerCase(), {
          name,
          role,
          slideIndex,
          context: slide.title,
        });
      }

      // Extract organizations
      for (const org of KNOWN_ORGANIZATIONS) {
        if (org.pattern.test(slideText)) {
          if (!foundOrgs.has(org.name.toLowerCase())) {
            foundOrgs.set(org.name.toLowerCase(), {
              name: org.name,
              slideIndex,
              context: slide.title,
            });
          }
        }
      }

      // Extract places
      for (const place of KNOWN_PLACES) {
        if (place.pattern.test(slideText)) {
          if (!foundPlaces.has(place.name.toLowerCase())) {
            foundPlaces.set(place.name.toLowerCase(), {
              name: place.name,
              type: place.type,
              slideIndex,
              context: slide.title,
            });
          }
        }
      }

      // Extract dates
      let dateMatch;

      // Full dates (Month DD, YYYY)
      FULL_DATE_PATTERN.lastIndex = 0;
      while ((dateMatch = FULL_DATE_PATTERN.exec(slideText)) !== null) {
        const month = formatMonth(dateMatch[1]);
        const day = dateMatch[2];
        const year = dateMatch[3];
        const raw = dateMatch[0];
        const formatted = `${month} ${day}, ${year}`;
        foundDates.set(formatted, {
          raw,
          formatted,
          year: parseInt(year),
          month,
          slideIndex,
          context: slide.title,
        });
      }

      // Month Year
      MONTH_YEAR_PATTERN.lastIndex = 0;
      while ((dateMatch = MONTH_YEAR_PATTERN.exec(slideText)) !== null) {
        const month = formatMonth(dateMatch[1]);
        const year = dateMatch[2];
        const raw = dateMatch[0];
        const formatted = `${month} ${year}`;
        if (!foundDates.has(formatted)) {
          foundDates.set(formatted, {
            raw,
            formatted,
            year: parseInt(year),
            month,
            slideIndex,
            context: slide.title,
          });
        }
      }

      // Quarters
      QUARTER_PATTERN.lastIndex = 0;
      while ((dateMatch = QUARTER_PATTERN.exec(slideText)) !== null) {
        const quarter = dateMatch[1];
        const year = dateMatch[2];
        const raw = dateMatch[0];
        const formatted = `Q${quarter} ${year}`;
        foundDates.set(formatted, {
          raw,
          formatted,
          year: parseInt(year),
          slideIndex,
          context: slide.title,
        });
      }

      // Extract tools
      for (const tool of KNOWN_TOOLS) {
        if (tool.pattern.test(slideText)) {
          if (!foundTools.has(tool.name.toLowerCase())) {
            foundTools.set(tool.name.toLowerCase(), {
              name: tool.name,
              description: tool.description,
            });
          }
        }
      }

      // Extract terms
      for (const termDef of KEY_TERMS) {
        if (termDef.pattern.test(slideText)) {
          if (!foundTerms.has(termDef.term.toLowerCase())) {
            foundTerms.set(termDef.term.toLowerCase(), {
              term: termDef.term,
              context: termDef.context,
            });
          }
        }
      }

      // Extract URLs
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

  return {
    people: Array.from(foundPeople.values()),
    organizations: Array.from(foundOrgs.values()),
    places: Array.from(foundPlaces.values()),
    dates: Array.from(foundDates.values()).sort((a, b) => (b.year || 0) - (a.year || 0)),
    quotes: Array.from(foundQuotes.values()),
    images: foundImages,
    tools: Array.from(foundTools.values()),
    terms: Array.from(foundTerms.values()),
    links: Array.from(foundLinks.values()),
  };
}
