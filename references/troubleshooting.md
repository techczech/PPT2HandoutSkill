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

## Entity extraction missing items
- Re-run entity analysis with more context
- Check if items are in speaker notes (sometimes overlooked)
- Manually add missing entities to `entities.json`
