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

### Links
- Extract all URLs from slide content and notes
- Classify each link by type (see Link Types below)
- Reconstruct split URLs that may span multiple lines

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
      "mentions": [
        { "slideIndex": 6, "context": "Slide title mentions them" }
      ]
    }
  ],
  "organizations": [
    {
      "name": "Organization Name",
      "context": "Why mentioned"
    }
  ],
  "quotes": [
    {
      "text": "The actual quote text...",
      "attribution": "Person Name",
      "source": "Tweet, November 30, 2022",
      "slideIndex": 9,
      "extractedFromImage": true,
      "topic": "ai_technology"
    }
  ],
  "links": [
    {
      "url": "https://example.com/tool",
      "label": "Example Tool",
      "slideIndex": 5,
      "linkType": "tool"
    }
  ],
  "tools": [
    {
      "name": "Tool Name",
      "context": "Why mentioned"
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
      "event": "What happened"
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

The Resources page reads from this file instead of using regex patterns.
