import { useState, useRef } from 'react';
import type { VideoContent } from '../../data/types';

interface VideoPlayerProps {
  content: VideoContent;
}

export default function VideoPlayer({ content }: VideoPlayerProps) {
  const [error, setError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (error) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-lg p-8 text-gray-500">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>Video unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <video
        ref={videoRef}
        src={content.src}
        controls
        preload="metadata"
        onError={() => setError(true)}
        className="w-full max-h-96 rounded-lg shadow-md bg-black"
      >
        Your browser does not support the video tag.
      </video>
      {content.title && (
        <p className="mt-2 text-sm text-gray-500 text-center">{content.title}</p>
      )}
    </div>
  );
}
