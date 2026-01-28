# Customization Reference

## Colors (src/index.css)

```css
:root {
  --color-primary: #1e3a5f;        /* Main brand color */
  --color-primary-light: #2d5a87;  /* Lighter variant */
  --color-accent: #e07a38;         /* Accent/highlight color */
  --color-surface: #faf9f7;        /* Background */
  --color-card: #ffffff;           /* Card backgrounds */
  --color-text: #2d3748;           /* Main text */
  --color-text-muted: #64748b;     /* Secondary text */
}
```

## Fonts

Default fonts are Inter (sans-serif) and Playfair Display (serif). Modify the Google Fonts import in `src/index.css` to change.

## Session Info Example

Create `src/data/sessionInfo.ts`:

```typescript
export const sessionInfo = {
  title: "My Workshop Title",
  subtitle: "A subtitle for the presentation",

  // Link to talk/presentation page (optional)
  talkPageUrl: "https://example.com/workshop",
  talkPageLabel: "Workshop Page", // e.g., "Talk Page", "Webinar Recording"

  speaker: {
    name: "Jane Doe",
    affiliation: "University of Example",
    email: "jane@example.edu",
    links: { website: "https://janedoe.com" },
    bio: "Jane is a researcher in..."
  },

  event: {
    name: "Conference 2026",  // Leave empty if standalone presentation
    date: "January 15, 2026",
    time: "14:00 - 15:30",
    location: "Room 101",
    type: "Workshop",  // Workshop, Talk, Seminar, Webinar
    sessionLink: "https://conference.com/session/123"
  },

  // Multi-paragraph abstract (use \n\n for paragraph breaks)
  // Displayed prominently on home page
  abstract: `This workshop covers AI fundamentals and practical applications.

Participants will gain hands-on experience with modern AI tools and learn to apply them in their research workflow.`,

  // Key topics - displayed as bullet points on home page
  keyTopics: [
    "AI foundations and capabilities",
    "Practical applications for research",
    "Building custom AI workflows",
  ],

  // Featured links - prominent resource links on home page
  featuredLinks: {
    title: "Tools Used",  // e.g., "Related Resources", "Example Apps"
    items: [
      { name: "Tool Name", url: "https://tool.example", description: "What it does" },
    ],
  },
};
```

### Homepage Structure

The homepage automatically displays:
1. **Hero** - Title, subtitle, speaker info
2. **CTA Cards** - Browse Slides + Talk Page (or Presenter Website)
3. **Abstract** - Prominently displayed (not collapsed)
4. **Key Topics** - Bullet list in a card
5. **Featured Links** - Grid of resource cards
6. **Index Preview** - Shows people, quotes, tools, terms, dates from entities.json
7. **Session Details** - Event info at bottom

## File Structure

```
project/
├── sourcematerials/           # Input (gitignored)
│   ├── presentation.json      # Extracted slide content
│   └── media/{uuid}/          # Images, videos
├── src/
│   ├── data/
│   │   ├── presentation.json  # Processed (generated)
│   │   ├── entities.json      # AI-extracted entities
│   │   ├── processingStats.json # AI analysis stats (optional)
│   │   ├── sessionInfo.ts     # Session metadata (customize)
│   │   └── types.ts           # TypeScript types
│   ├── components/            # React components (don't modify)
│   ├── pages/                 # Page components (don't modify)
│   ├── utils/
│   │   └── extractResources.ts # Reads from entities.json
│   └── index.css              # Styles (customize colors)
├── public/assets/             # Static media (generated)
├── scripts/
│   ├── processMedia.js        # Build-time processor
│   ├── extract-pptx.py        # PPTX extractor
│   ├── analyze-existing-images.py  # AI image analysis
│   └── categorize-from-descriptions.py # Local categorization
└── package.json
```
