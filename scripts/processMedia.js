import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

// Auto-detect UUID folder in sourcematerials/media/
const mediaBaseDir = path.join(ROOT_DIR, 'sourcematerials/media');
let SOURCE_DIR = null;
if (fs.existsSync(mediaBaseDir)) {
  const uuidFolders = fs.readdirSync(mediaBaseDir).filter(f =>
    fs.statSync(path.join(mediaBaseDir, f)).isDirectory()
  );
  if (uuidFolders.length > 0) {
    SOURCE_DIR = path.join(mediaBaseDir, uuidFolders[0]);
    console.log(`Found media folder: ${uuidFolders[0]}`);
  }
}
const DEST_IMAGES_SLIDES = path.join(ROOT_DIR, 'public/assets/images/slides');
const DEST_IMAGES_ICONS = path.join(ROOT_DIR, 'public/assets/images/icons');
const DEST_VIDEOS = path.join(ROOT_DIR, 'public/assets/videos');
const PRESENTATION_JSON = path.join(ROOT_DIR, 'sourcematerials/presentation.json');
const DATA_OUTPUT = path.join(ROOT_DIR, 'src/data/presentation.json');

// Create directories
[DEST_IMAGES_SLIDES, DEST_IMAGES_ICONS, DEST_VIDEOS].forEach(dir => {
  fs.mkdirSync(dir, { recursive: true });
});

// Copy and organize media files
if (SOURCE_DIR && fs.existsSync(SOURCE_DIR)) {
  const files = fs.readdirSync(SOURCE_DIR);
  let imageCount = 0;
  let videoCount = 0;
  let iconCount = 0;

  files.forEach(file => {
    const src = path.join(SOURCE_DIR, file);
    const ext = path.extname(file).toLowerCase();

    if (ext === '.mp4') {
      fs.copyFileSync(src, path.join(DEST_VIDEOS, file));
      videoCount++;
    } else if (file.startsWith('sa_')) {
      fs.copyFileSync(src, path.join(DEST_IMAGES_ICONS, file));
      iconCount++;
    } else if (['.png', '.jpg', '.jpeg', '.gif'].includes(ext)) {
      fs.copyFileSync(src, path.join(DEST_IMAGES_SLIDES, file));
      imageCount++;
    }
  });

  console.log(`Media processing complete!`);
  console.log(`  - Slide images: ${imageCount}`);
  console.log(`  - Icons: ${iconCount}`);
  console.log(`  - Videos: ${videoCount}`);
} else {
  console.log('Source media directory not found, skipping media copy...');
}

// Copy and transform presentation JSON
if (fs.existsSync(PRESENTATION_JSON)) {
  // Ensure data directory exists
  fs.mkdirSync(path.dirname(DATA_OUTPUT), { recursive: true });

  // Read and transform the JSON
  const presentationData = JSON.parse(fs.readFileSync(PRESENTATION_JSON, 'utf-8'));

  // Transform media paths to use public assets
  function transformPath(srcPath) {
    if (!srcPath) return srcPath;
    const filename = path.basename(srcPath);
    const ext = path.extname(filename).toLowerCase();

    if (ext === '.mp4') {
      return `/assets/videos/${filename}`;
    } else if (filename.startsWith('sa_')) {
      return `/assets/images/icons/${filename}`;
    } else {
      return `/assets/images/slides/${filename}`;
    }
  }

  function transformContent(content) {
    if (!content) return content;

    return content.map(item => {
      if (item.type === 'image') {
        return { ...item, src: transformPath(item.src) };
      } else if (item.type === 'video') {
        return { ...item, src: transformPath(item.src) };
      } else if (item.type === 'smart_art') {
        return {
          ...item,
          nodes: transformSmartArtNodes(item.nodes)
        };
      }
      return item;
    });
  }

  function transformSmartArtNodes(nodes) {
    if (!nodes) return nodes;
    return nodes.map(node => ({
      ...node,
      icon: transformPath(node.icon),
      children: transformSmartArtNodes(node.children)
    }));
  }

  // Transform all slides
  const transformedData = {
    ...presentationData,
    sections: presentationData.sections.map(section => ({
      ...section,
      slides: section.slides.map(slide => ({
        ...slide,
        // Clean up special characters in titles
        title: slide.title ? slide.title.replace(/\u000b/g, ' ') : slide.title,
        content: transformContent(slide.content)
      }))
    }))
  };

  fs.writeFileSync(DATA_OUTPUT, JSON.stringify(transformedData, null, 2));
  console.log('Presentation data transformed and saved!');
} else {
  console.log('Presentation JSON not found, skipping...');
}
