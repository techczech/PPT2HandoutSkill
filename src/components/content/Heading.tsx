import type { HeadingContent } from '../../data/types';

interface HeadingProps {
  content: HeadingContent;
  theme?: 'light' | 'dark';
}

export default function Heading({ content, theme = 'light' }: HeadingProps) {
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';

  const sizeClasses: Record<number, string> = {
    1: 'text-2xl md:text-3xl font-bold',
    2: 'text-xl md:text-2xl font-semibold',
    3: 'text-lg md:text-xl font-semibold',
    4: 'text-base md:text-lg font-medium',
    5: 'text-sm md:text-base font-medium',
    6: 'text-sm font-medium',
  };

  const className = `${sizeClasses[content.level] || sizeClasses[3]} ${textColor} leading-tight`;
  const level = Math.min(Math.max(content.level, 1), 6);

  switch (level) {
    case 1:
      return <h1 className={className}>{content.text}</h1>;
    case 2:
      return <h2 className={className}>{content.text}</h2>;
    case 3:
      return <h3 className={className}>{content.text}</h3>;
    case 4:
      return <h4 className={className}>{content.text}</h4>;
    case 5:
      return <h5 className={className}>{content.text}</h5>;
    default:
      return <h6 className={className}>{content.text}</h6>;
  }
}
