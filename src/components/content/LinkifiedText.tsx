import { linkifyText, containsUrl } from '../../utils/linkify';

interface LinkifiedTextProps {
  text: string;
  className?: string;
}

/**
 * Renders text with URLs converted to clickable links.
 * Links open in new tabs and show clean display text.
 */
export default function LinkifiedText({ text, className = '' }: LinkifiedTextProps) {
  // Fast path: no URLs in text
  if (!containsUrl(text)) {
    return <span className={className}>{text}</span>;
  }

  const parts = linkifyText(text);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.type === 'link') {
          return (
            <a
              key={index}
              href={part.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              title={part.href}
            >
              {part.display}
            </a>
          );
        }
        return <span key={index}>{part.content}</span>;
      })}
    </span>
  );
}
