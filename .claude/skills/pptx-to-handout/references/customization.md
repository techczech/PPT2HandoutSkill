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
  speaker: {
    name: "Jane Doe",
    affiliation: "University of Example",
    email: "jane@example.edu",
    links: { website: "https://janedoe.com" },
    bio: "Jane is a researcher in..."
  },
  event: {
    name: "Conference 2026",
    date: "January 15, 2026",
    time: "14:00 - 15:30",
    location: "Room 101",
    type: "Workshop",
    sessionLink: "https://conference.com/session/123"
  },
  abstract: "This workshop covers...",
  exampleApps: [
    { name: "Demo App", url: "https://demo.app", description: "Example" }
  ]
};
```

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
