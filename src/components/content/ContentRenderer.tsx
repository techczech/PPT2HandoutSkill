import type { ContentBlock } from '../../data/types';
import Heading from './Heading';
import BulletList from './BulletList';
import ImageBlock from './ImageBlock';
import SmartArtDiagram from './SmartArtDiagram';
import VideoPlayer from './VideoPlayer';

interface ContentRendererProps {
  content: ContentBlock;
  theme?: 'light' | 'dark';
}

export default function ContentRenderer({ content, theme = 'light' }: ContentRendererProps) {
  switch (content.type) {
    case 'heading':
      return <Heading content={content} theme={theme} />;
    case 'list':
      return <BulletList content={content} theme={theme} />;
    case 'image':
      return <ImageBlock content={content} />;
    case 'smart_art':
      return <SmartArtDiagram content={content} />;
    case 'video':
      return <VideoPlayer content={content} />;
    default:
      return null;
  }
}
