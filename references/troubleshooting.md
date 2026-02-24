# Troubleshooting

## Images not showing
- Check that media files are in `sourcematerials/media/{uuid}/`
- Run `npm run build` to process media
- Verify paths in `src/data/presentation.json`

## Slides not rendering
- Check `presentation.json` structure matches expected format
- Verify TypeScript types in `src/data/types.ts`
- Check browser console for errors

## SmartArt not displaying correctly
- SmartArt is extracted as images by default
- For complex diagrams, manually recreate structure in JSON
- Use `smart_art` content type with nested nodes

## Videos too large for Cloudflare
- Cloudflare Pages has 25MB file limit
- Install ffmpeg: `brew install ffmpeg` (macOS) or `apt-get install ffmpeg` (Linux)
- The build script auto-compresses videos over 25MB when ffmpeg is available

## Heading content not showing in slides

PowerPoint sometimes classifies body text as "heading" content blocks. The old filter `slide.content.filter(c => c.type !== 'heading')` drops ALL headings, which loses this body text.

**Fix:** Use the smart filter that only drops headings matching the slide title:
```ts
slide.content.filter(c =>
  c.type !== 'heading' || ('text' in c && c.text !== slide.title)
)
```

This preserves heading blocks whose text differs from the slide title (i.e., actual body content misclassified as headings). Applied in: `SidebarSlide.tsx`, `ContentSlide.tsx`, `TitleSlide.tsx`, `OutlineView.tsx`, and `MediaSlide.tsx`.

## Entity extraction missing items
- Re-run entity analysis with more context
- Check if items are in speaker notes (sometimes overlooked)
- Manually add missing entities to `entities.json`
