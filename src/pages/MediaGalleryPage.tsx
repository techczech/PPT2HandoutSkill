import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Presentation, Section, Slide, ContentBlock, ImageContent, VideoContent } from '../data/types';
import presentationData from '../data/presentation.json';
import entitiesData from '../data/entities.json';

interface MediaItem {
  type: 'image' | 'video';
  src: string;
  alt?: string;
  caption?: string;
  description?: string;  // AI-generated description from entities.json
  title?: string;
  slideIndex: number;
  slideTitle: string;
  sectionTitle: string;
}

// Get AI-generated descriptions from entities.json
interface EntityImage {
  src: string;
  description: string;
  slideIndex: number;
  containsQuote?: boolean;
}

const entityImages = (entitiesData.images || []) as EntityImage[];

function extractMedia(content: ContentBlock): (ImageContent | VideoContent)[] {
  if (content.type === 'image') {
    return [content];
  }
  if (content.type === 'video') {
    return [content];
  }
  return [];
}

export default function MediaGalleryPage() {
  const presentation = presentationData as Presentation;
  const [filter, setFilter] = useState<'all' | 'images' | 'videos' | 'key'>('all');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  // Extract all media from the presentation
  const allMedia = useMemo<MediaItem[]>(() => {
    const items: MediaItem[] = [];
    let globalIndex = 0;

    presentation.sections.forEach((section: Section) => {
      section.slides.forEach((slide: Slide) => {
        slide.content.forEach(content => {
          const mediaItems = extractMedia(content);
          mediaItems.forEach(media => {
            if (media.type === 'image') {
              // Find AI-generated description from entities.json
              const entityImage = entityImages.find(ei => ei.src === media.src);
              items.push({
                type: 'image',
                src: media.src,
                alt: media.alt,
                caption: media.caption,
                description: entityImage?.description,
                slideIndex: globalIndex,
                slideTitle: slide.title || 'Untitled slide',
                sectionTitle: section.title,
              });
            } else if (media.type === 'video') {
              items.push({
                type: 'video',
                src: media.src,
                title: media.title,
                slideIndex: globalIndex,
                slideTitle: slide.title || 'Untitled slide',
                sectionTitle: section.title,
              });
            }
          });
        });
        globalIndex++;
      });
    });

    return items;
  }, [presentation]);

  const filteredMedia = useMemo(() => {
    if (filter === 'all') return allMedia;
    if (filter === 'images') return allMedia.filter(m => m.type === 'image');
    if (filter === 'key') return allMedia.filter(m => m.type === 'image' && m.description);
    return allMedia.filter(m => m.type === 'video');
  }, [allMedia, filter]);

  const imageCount = allMedia.filter(m => m.type === 'image').length;
  const videoCount = allMedia.filter(m => m.type === 'video').length;
  const keyCount = allMedia.filter(m => m.type === 'image' && m.description).length;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="hero">
        <div className="flex items-center gap-4 mb-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Link>
        </div>
        <h1 className="font-serif">Media Gallery</h1>
        <p className="mt-2 text-white/80">
          {imageCount} images · {videoCount} videos
        </p>
      </div>

      {/* Content */}
      <div className="page-content">
        {/* Filter buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({allMedia.length})
          </button>
          {keyCount > 0 && (
            <button
              onClick={() => setFilter('key')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'key'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✨ Key Images ({keyCount})
            </button>
          )}
          <button
            onClick={() => setFilter('images')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'images'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Images ({imageCount})
          </button>
          <button
            onClick={() => setFilter('videos')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'videos'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Videos ({videoCount})
          </button>
        </div>

        {/* Media grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((item, index) => (
            <div
              key={index}
              className="group relative bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
              onClick={() => setSelectedMedia(item)}
            >
              {item.type === 'image' ? (
                <img
                  src={item.src}
                  alt={item.alt || item.slideTitle}
                  className="w-full aspect-video object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full aspect-video flex items-center justify-center bg-gray-800">
                  <svg
                    className="w-12 h-12 text-white/60"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              )}

              {/* Caption overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <p className="text-white text-sm truncate">
                  {item.description || item.slideTitle}
                </p>
                <p className="text-white/60 text-xs truncate">
                  Slide {item.slideIndex + 1} · {item.sectionTitle}
                </p>
              </div>
              {/* Badge for images with AI descriptions */}
              {item.description && (
                <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  ✨ Key
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredMedia.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No {filter === 'all' ? 'media' : filter} found in this presentation.
          </div>
        )}
      </div>

      {/* Lightbox modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            onClick={() => setSelectedMedia(null)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div
            className="max-w-4xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedMedia.type === 'image' ? (
              <img
                src={selectedMedia.src}
                alt={selectedMedia.alt || selectedMedia.slideTitle}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            ) : (
              <video
                src={selectedMedia.src}
                controls
                className="max-w-full max-h-[70vh] rounded-lg"
              >
                Your browser does not support video playback.
              </video>
            )}

            <div className="mt-4 text-center max-w-2xl mx-auto">
              {selectedMedia.description ? (
                <>
                  <p className="text-white font-medium">{selectedMedia.description}</p>
                  <p className="text-white/60 text-sm mt-1">{selectedMedia.slideTitle}</p>
                </>
              ) : (
                <p className="text-white font-medium">{selectedMedia.slideTitle}</p>
              )}
              <p className="text-white/60 text-sm">{selectedMedia.sectionTitle}</p>
              <Link
                to={`/slides/${selectedMedia.slideIndex + 1}`}
                className="inline-block mt-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Go to slide {selectedMedia.slideIndex + 1}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
