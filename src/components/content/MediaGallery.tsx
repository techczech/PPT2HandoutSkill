import { useState, useEffect, useCallback } from 'react';
import type { ImageContent, VideoContent } from '../../data/types';

type MediaItem =
  | (ImageContent & { mediaType: 'image' })
  | (VideoContent & { mediaType: 'video' });

interface MediaGalleryProps {
  images?: ImageContent[];
  videos?: VideoContent[];
}

export default function MediaGallery({ images = [], videos = [] }: MediaGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loadedMedia, setLoadedMedia] = useState<Set<number>>(new Set());

  // Combine images and videos into unified media array
  const mediaItems: MediaItem[] = [
    ...images.map(img => ({ ...img, mediaType: 'image' as const })),
    ...videos.map(vid => ({ ...vid, mediaType: 'video' as const })),
  ];

  const totalCount = mediaItems.length;

  // Calculate grid columns based on media count
  const getGridCols = (count: number): string => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count === 3) return 'grid-cols-3';
    if (count === 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  // Get appropriate item height based on count
  const getItemHeight = (count: number): string => {
    if (count === 1) return 'max-h-[60vh]';
    if (count === 2) return 'max-h-[50vh]';
    if (count <= 4) return 'max-h-[35vh]';
    if (count <= 6) return 'max-h-[30vh]';
    return 'max-h-[25vh]';
  };

  const handleMediaLoad = (index: number) => {
    setLoadedMedia(prev => new Set(prev).add(index));
  };

  const openLightbox = (index: number) => {
    // Only open lightbox for images
    if (mediaItems[index].mediaType === 'image') {
      setSelectedIndex(index);
    }
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const goToPrev = useCallback(() => {
    if (selectedIndex === null) return;
    // Find previous image (skip videos)
    let newIndex = selectedIndex - 1;
    while (newIndex >= 0 && mediaItems[newIndex].mediaType !== 'image') {
      newIndex--;
    }
    if (newIndex >= 0) {
      setSelectedIndex(newIndex);
    }
  }, [selectedIndex, mediaItems]);

  const goToNext = useCallback(() => {
    if (selectedIndex === null) return;
    // Find next image (skip videos)
    let newIndex = selectedIndex + 1;
    while (newIndex < mediaItems.length && mediaItems[newIndex].mediaType !== 'image') {
      newIndex++;
    }
    if (newIndex < mediaItems.length) {
      setSelectedIndex(newIndex);
    }
  }, [selectedIndex, mediaItems]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, goToPrev, goToNext]);

  if (totalCount === 0) return null;

  // Single item - render centered
  if (totalCount === 1) {
    const item = mediaItems[0];
    if (item.mediaType === 'video') {
      return (
        <div className="flex items-center justify-center w-full h-full">
          <div className="max-w-full">
            <video
              src={item.src}
              controls
              preload="metadata"
              className="max-w-full max-h-[60vh] rounded-lg shadow-md bg-black"
            >
              Your browser does not support the video tag.
            </video>
            {item.title && (
              <p className="mt-2 text-sm text-gray-500 text-center">{item.title}</p>
            )}
          </div>
        </div>
      );
    }
    // Single image
    return (
      <figure className="flex flex-col items-center justify-center w-full h-full">
        <img
          src={item.src}
          alt={item.alt || 'Slide image'}
          className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => openLightbox(0)}
        />
        {item.caption && (
          <figcaption className="mt-2 text-sm text-gray-500 text-center">
            {item.caption}
          </figcaption>
        )}
        {selectedIndex !== null && (
          <Lightbox
            images={images}
            currentIndex={selectedIndex}
            onClose={closeLightbox}
            onPrev={goToPrev}
            onNext={goToNext}
          />
        )}
      </figure>
    );
  }

  // Multiple items - render as centered grid
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className={`grid ${getGridCols(totalCount)} gap-2 md:gap-3 place-items-center`}>
        {mediaItems.map((item, index) => (
          <div
            key={index}
            className={`relative cursor-pointer group overflow-hidden rounded-lg bg-gray-100 ${getItemHeight(totalCount)} w-full`}
            onClick={() => openLightbox(index)}
          >
            {item.mediaType === 'video' ? (
              // Video thumbnail/player
              <video
                src={item.src}
                controls
                preload="metadata"
                onLoadedData={() => handleMediaLoad(index)}
                className="w-full h-full object-contain bg-black"
                onClick={(e) => e.stopPropagation()}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              // Image
              <>
                {!loadedMedia.has(index) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <img
                  src={item.src}
                  alt={item.alt || `Image ${index + 1}`}
                  className={`w-full h-full object-contain transition-all group-hover:scale-105 ${
                    loadedMedia.has(index) ? 'opacity-100' : 'opacity-0'
                  }`}
                  loading="lazy"
                  onLoad={() => handleMediaLoad(index)}
                />
                {/* Hover overlay for images */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
              </>
            )}
            {/* Media number badge */}
            <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
              {item.mediaType === 'video' ? '▶' : ''} {index + 1}/{totalCount}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox for images only */}
      {selectedIndex !== null && mediaItems[selectedIndex]?.mediaType === 'image' && (
        <Lightbox
          images={images}
          currentIndex={images.findIndex(img => img.src === mediaItems[selectedIndex].src)}
          onClose={closeLightbox}
          onPrev={goToPrev}
          onNext={goToNext}
        />
      )}
    </div>
  );
}

// Lightbox component for full-screen image viewing
function Lightbox({
  images,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}: {
  images: ImageContent[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const image = images[currentIndex];
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
        onClick={onClose}
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Previous button */}
      {images.length > 1 && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 bg-black/30 rounded-full"
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Image */}
      <div
        className="max-w-[90vw] max-h-[85vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image.src}
          alt={image.alt || 'Image'}
          className="max-w-full max-h-[75vh] object-contain"
        />
        {/* Caption and description */}
        <div className="mt-4 text-center max-w-2xl">
          {image.caption && (
            <p className="text-white text-sm">{image.caption}</p>
          )}
          {image.description && (
            <p className="text-white/70 text-xs mt-1">{image.description}</p>
          )}
          {/* Counter */}
          <p className="text-white/50 text-xs mt-2">
            {currentIndex + 1} of {images.length}
          </p>
        </div>
      </div>

      {/* Next button */}
      {images.length > 1 && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 bg-black/30 rounded-full"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Keyboard hints */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-xs">
        ← → navigate • Esc close
      </div>
    </div>
  );
}
