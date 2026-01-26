import type { ContentBlock, ShapeContent } from '../../data/types';
import Heading from './Heading';
import BulletList from './BulletList';
import ImageBlock from './ImageBlock';
import SmartArtDiagram from './SmartArtDiagram';
import VideoPlayer from './VideoPlayer';
import ShapeBlock from './ShapeBlock';

interface ContentRendererProps {
  content: ContentBlock;
  theme?: 'light' | 'dark';
  fillSpace?: boolean;
  size?: 'default' | 'large' | 'featured';
}

export default function ContentRenderer({ content, theme = 'light', fillSpace = false, size = 'default' }: ContentRendererProps) {
  switch (content.type) {
    case 'heading':
      return <Heading content={content} theme={theme} />;
    case 'list':
      return <BulletList content={content} theme={theme} size={size} />;
    case 'image':
      return <ImageBlock content={content} />;
    case 'smart_art':
      return <SmartArtDiagram content={content} fillSpace={fillSpace} theme={theme} />;
    case 'video':
      return <VideoPlayer content={content} />;
    case 'shape':
      return <ShapeBlock content={content as ShapeContent} />;
    default:
      return null;
  }
}
