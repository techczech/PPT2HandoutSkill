import type { Presentation, ContentBlock, SmartArtNode } from '../data/types';

export interface ExtractedResources {
  tools: { name: string; description?: string }[];
  links: { url: string; label: string }[];
  terms: { term: string; context?: string }[];
}

// Known tools to look for in content
const KNOWN_TOOLS = [
  { pattern: /google ai studio/i, name: 'Google AI Studio', description: 'Free AI development environment from Google' },
  { pattern: /gemini/i, name: 'Gemini', description: 'Google\'s multimodal AI model' },
  { pattern: /claude/i, name: 'Claude', description: 'Anthropic\'s AI assistant' },
  { pattern: /chatgpt/i, name: 'ChatGPT', description: 'OpenAI\'s conversational AI' },
  { pattern: /lovable/i, name: 'Lovable.dev', description: 'AI-powered web app builder' },
  { pattern: /replit/i, name: 'Replit', description: 'Browser-based coding environment' },
  { pattern: /v0\.dev|v0 by vercel/i, name: 'v0.dev', description: 'AI UI component generator by Vercel' },
  { pattern: /cursor/i, name: 'Cursor', description: 'AI-powered code editor' },
  { pattern: /github copilot/i, name: 'GitHub Copilot', description: 'AI pair programmer' },
  { pattern: /bolt\.new/i, name: 'Bolt.new', description: 'AI-powered full-stack app builder' },
  { pattern: /windsurf/i, name: 'Windsurf', description: 'AI coding IDE by Codeium' },
];

// Key terms to identify
const KEY_TERMS = [
  { pattern: /vibe\s*coding|vibecoding/i, term: 'Vibecoding', context: 'AI-assisted coding where you describe what you want in natural language' },
  { pattern: /\bllm\b/i, term: 'LLM', context: 'Large Language Model - AI models trained on text data' },
  { pattern: /prompt engineering/i, term: 'Prompt Engineering', context: 'Crafting effective instructions for AI models' },
  { pattern: /zero[- ]shot/i, term: 'Zero-shot', context: 'AI completing tasks without specific examples' },
  { pattern: /few[- ]shot/i, term: 'Few-shot', context: 'AI learning from a few examples in the prompt' },
  { pattern: /hallucination/i, term: 'Hallucination', context: 'When AI generates plausible but incorrect information' },
  { pattern: /token/i, term: 'Token', context: 'Basic units of text that AI models process' },
  { pattern: /api/i, term: 'API', context: 'Application Programming Interface - how programs communicate' },
];

// URL pattern
const URL_PATTERN = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+)(?:\/[^\s)]*)?/gi;
const SHORTLINK_PATTERN = /(?:bit\.ly|linktr\.ee|tinyurl\.com)\/[a-zA-Z0-9-]+/gi;

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

export function extractResources(presentation: Presentation): ExtractedResources {
  const foundTools = new Map<string, { name: string; description?: string }>();
  const foundLinks = new Map<string, { url: string; label: string }>();
  const foundTerms = new Map<string, { term: string; context?: string }>();

  // Collect all text from slides
  const allText: string[] = [];
  for (const section of presentation.sections) {
    for (const slide of section.slides) {
      allText.push(slide.title);
      allText.push(...extractTextFromContent(slide.content));
    }
  }

  const combinedText = allText.join(' ');

  // Find tools
  for (const tool of KNOWN_TOOLS) {
    if (tool.pattern.test(combinedText)) {
      foundTools.set(tool.name.toLowerCase(), { name: tool.name, description: tool.description });
    }
  }

  // Find URLs
  const urlMatches = combinedText.match(URL_PATTERN) || [];
  const shortlinkMatches = combinedText.match(SHORTLINK_PATTERN) || [];

  for (const url of [...urlMatches, ...shortlinkMatches]) {
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    const domain = url.replace(/^https?:\/\//, '').split('/')[0];

    // Skip common non-resource URLs
    if (domain.includes('example.com') || domain.includes('localhost')) continue;

    foundLinks.set(cleanUrl.toLowerCase(), {
      url: cleanUrl,
      label: domain,
    });
  }

  // Find terms
  for (const termDef of KEY_TERMS) {
    if (termDef.pattern.test(combinedText)) {
      foundTerms.set(termDef.term.toLowerCase(), { term: termDef.term, context: termDef.context });
    }
  }

  return {
    tools: Array.from(foundTools.values()),
    links: Array.from(foundLinks.values()),
    terms: Array.from(foundTerms.values()),
  };
}
