# Entities Format Reference

This document describes the `entities.json` format used by the Resources page.

## Entity Types

### People
- Scan all slide titles, content, and notes for people mentioned
- Look for: names in titles, attributed quotes, speaker names, people shown in images
- Include their role/affiliation if mentioned
- Track which slides mention them

### Quotes
- A quote is a statement attributed to a specific person or source
- Quotes may appear:
  - As text on the slide itself (check slide content)
  - In speaker notes
  - In images (tweets, messages, book excerpts)
- **Do NOT treat random text in images as quotes**
- Include: full quote text, attribution, source type, date if available

### Images
For images, provide a rich description including:
- What type of content it is (tweet, chart, photo, screenshot, diagram)
- Any people shown or mentioned
- Date/time if visible
- Source if identifiable
- If image contains a quote, reference it (don't duplicate the text)

### Organizations
- Identify companies, institutions, research groups mentioned
- Note their context (product maker, research source, etc.)

### Dates & Events
- Extract significant dates mentioned
- Include what happened on that date

### Tools & Products
- Identify AI tools, products, services mentioned
- Include brief context of why mentioned

### Terms
- Identify key technical terms used
- Include brief definitions

### Links (AI-Extracted, Semantic)
**IMPORTANT:** Links are NOT extracted via regex. The AI must read and understand each slide to:
- Identify meaningful URLs contextually (not just pattern-matched strings)
- Reconstruct split URLs that may span multiple lines in presentations
- Provide human-readable titles and descriptions explaining what the link offers
- Classify each link by type (see Link Types below)
- Only include links that are useful to the presentation's audience

## Link Types

When extracting links, classify them by type:

| Type | Description |
|------|-------------|
| `tool` | AI tools, software, applications |
| `demo` | Live demos, interactive examples |
| `article` | Blog posts, news articles |
| `documentation` | Official docs, guides |
| `research` | Academic papers, studies |
| `personal` | Personal websites, profiles |
| `website` | General websites |

## Image Categories

Assign one of these categories to each image:

| Category | Description |
|----------|-------------|
| `cartoon` | Illustrations, drawings, comics, memes with drawn characters |
| `interface_screenshot` | Software UI, app interfaces, website screenshots |
| `chat_screenshot` | Slack, Teams, Discord, or other chat app messages |
| `tweet` | Twitter/X posts |
| `quote` | Text-based quotes or blockquotes |
| `academic_paper` | Research paper pages, citations, abstracts |
| `diagram` | Technical diagrams, flowcharts, architecture diagrams |
| `chart` | Data visualizations, graphs, bar charts, line charts |
| `photo_person` | Photographs of people |
| `book_cover` | Book covers, ebook covers |
| `product_page` | E-commerce or product listing pages |
| `other` | Anything that doesn't fit above categories |

## JSON Schema

```json
{
  "people": [
    {
      "name": "Person Name",
      "role": "Role or affiliation",
      "slideIndex": 6
    }
  ],
  "organizations": [
    {
      "name": "Organization Name",
      "description": "Brief description or context"
    }
  ],
  "quotes": [
    {
      "text": "The actual quote text...",
      "attribution": "Person Name, Source Title",
      "slideIndex": 9,
      "topic": "ai_technology",
      "extractedFromImage": true
    }
  ],
  "links": [
    {
      "url": "https://example.com/article",
      "title": "Article Title",
      "description": "Brief description of what the link contains",
      "slideIndex": 5,
      "linkType": "article"
    }
  ],
  "tools": [
    {
      "name": "Tool Name",
      "description": "What the tool does",
      "url": "https://tool-url.com",
      "category": "chatbot"
    }
  ],
  "terms": [
    {
      "term": "Technical Term",
      "definition": "Brief definition"
    }
  ],
  "dates": [
    {
      "date": "November 30, 2022",
      "event": "What happened",
      "slideIndex": 5
    }
  ],
  "images": [
    {
      "src": "/assets/images/slides/slide_9_5.png",
      "description": "Screenshot of a tweet from Sam Altman...",
      "slideIndex": 9,
      "category": "tweet",
      "containsQuote": true
    }
  ]
}
```

## Quote Topics

Use these topic tags to categorize quotes for filtering:

| Topic | Description |
|-------|-------------|
| `ai_technology` | General AI/tech quotes |
| `ai_limitations` | AI errors, hallucinations, benchmarks |
| `ai_ethics` | Ethics, labor, environmental concerns |
| `ai_future` | Predictions, future capabilities |
| `learning` | Education, skill development |
| `human_error` | Human mistakes, cognitive biases |
| `computing_history` | Historical perspectives on computing |

## Tool Categories

Categorize tools by their primary function:

| Category | Description |
|----------|-------------|
| `chatbot` | Conversational AI interfaces (ChatGPT, Claude, Gemini) |
| `research` | Academic/research tools (Elicit, Consensus, NotebookLM) |
| `development` | Code editors, app builders (Cursor, Loveable) |
| `productivity` | Note-taking, workflow tools (Notion, Microsoft 365) |

## Important Notes

- The Resources page reads entities ONLY from this file
- No mechanical regex extraction is used - all entities must be AI-extracted
- Links especially require semantic understanding, not pattern matching
- Ensure all URLs are complete, validated, and have meaningful descriptions
