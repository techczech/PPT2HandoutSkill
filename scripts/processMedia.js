import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

// Video compression settings
const MAX_VIDEO_SIZE_MB = 25; // Cloudflare Pages limit
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

// Check if ffmpeg is available
function hasFFmpeg() {
  try {
    execSync('which ffmpeg', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Get video duration and size
function getVideoInfo(videoPath) {
  try {
    const output = execSync(
      `ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 "${videoPath}"`,
      { encoding: 'utf-8' }
    );
    const duration = parseFloat(output.match(/duration=([\d.]+)/)?.[1] || 0);
    const size = parseInt(output.match(/size=(\d+)/)?.[1] || 0);
    return { duration, size };
  } catch (error) {
    console.error(`Failed to get video info for ${path.basename(videoPath)}`);
    return null;
  }
}

// Compress video using ffmpeg
function compressVideo(inputPath, outputPath, targetSizeMB) {
  const info = getVideoInfo(inputPath);
  if (!info) return false;

  const { duration, size } = info;
  const currentSizeMB = size / (1024 * 1024);

  // Calculate target bitrate (80% of target size to leave headroom)
  const targetBitsPerSecond = ((targetSizeMB * 0.8 * 8 * 1024 * 1024) / duration) - 64000; // subtract audio bitrate
  const videoBitrate = Math.max(180, Math.floor(targetBitsPerSecond / 1000)); // kbps, min 180k

  console.log(`    Compressing ${path.basename(inputPath)} (${currentSizeMB.toFixed(1)}MB → target ${targetSizeMB}MB)...`);

  try {
    execSync(
      `ffmpeg -i "${inputPath}" -c:v libx264 -b:v ${videoBitrate}k -c:a aac -b:a 64k -movflags +faststart "${outputPath}" -y`,
      { stdio: 'pipe' }
    );

    const newSize = fs.statSync(outputPath).size;
    const newSizeMB = newSize / (1024 * 1024);
    console.log(`    ✓ Compressed to ${newSizeMB.toFixed(1)}MB (${videoBitrate}kbps)`);
    return true;
  } catch (error) {
    console.error(`    ✗ Failed to compress video: ${error.message}`);
    return false;
  }
}

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
  let compressedCount = 0;
  const ffmpegAvailable = hasFFmpeg();

  if (!ffmpegAvailable) {
    console.log('⚠️  ffmpeg not found - large videos will not be compressed');
    console.log('   Install ffmpeg to enable automatic video compression for Cloudflare Pages');
  }

  files.forEach(file => {
    const src = path.join(SOURCE_DIR, file);
    const ext = path.extname(file).toLowerCase();

    if (ext === '.mp4') {
      const dest = path.join(DEST_VIDEOS, file);
      const fileSize = fs.statSync(src).size;

      // Check if video needs compression
      if (ffmpegAvailable && fileSize > MAX_VIDEO_SIZE_BYTES) {
        const fileSizeMB = fileSize / (1024 * 1024);
        console.log(`  Video ${file} is ${fileSizeMB.toFixed(1)}MB (exceeds ${MAX_VIDEO_SIZE_MB}MB limit)`);

        // Compress video
        const tempDest = dest + '.tmp.mp4';
        const compressed = compressVideo(src, tempDest, MAX_VIDEO_SIZE_MB - 1);

        if (compressed) {
          fs.renameSync(tempDest, dest);
          compressedCount++;
        } else {
          // Fallback: copy original if compression fails
          console.log(`    ⚠️  Using original file (compression failed)`);
          fs.copyFileSync(src, dest);
        }
      } else {
        // Copy video as-is if small enough or ffmpeg unavailable
        fs.copyFileSync(src, dest);
      }
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
  console.log(`  - Videos: ${videoCount}${compressedCount > 0 ? ` (${compressedCount} compressed)` : ''}`);
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
