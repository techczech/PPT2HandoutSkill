import { useState } from 'react';
import type { ImageContent } from '../../data/types';

interface ImageBlockProps {
  content: ImageContent;
}

export default function ImageBlock({ content }: ImageBlockProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (error) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-lg p-4 text-gray-500">
        <span>Image unavailable</span>
      </div>
    );
  }

  return (
    <figure className="flex flex-col items-center">
      <div className="relative">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <img
          src={content.src}
          alt={content.alt || 'Slide image'}
          onError={() => setError(true)}
          onLoad={() => setLoaded(true)}
          className={`max-w-full max-h-96 object-contain rounded-lg shadow-sm transition-opacity ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>
      {content.caption && (
        <figcaption className="mt-2 text-sm text-gray-500 text-center">
          {content.caption}
        </figcaption>
      )}
    </figure>
  );
}
