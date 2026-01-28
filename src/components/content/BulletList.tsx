import type { ListContent, ListItem, TextRun } from '../../data/types';
import LinkifiedText from './LinkifiedText';

interface BulletListProps {
  content: ListContent;
  theme?: 'light' | 'dark';
  size?: 'default' | 'large' | 'featured';
  noBullets?: boolean;
}

// Size classes for different contexts
const sizeClasses = {
  default: 'text-base',
  large: 'text-lg md:text-xl lg:text-2xl',
  featured: 'text-xl md:text-2xl lg:text-3xl',
};

// Render text runs with formatting (bold, color, etc.)
function FormattedText({ runs, fallbackText }: { runs?: TextRun[]; fallbackText: string }) {
  // If no runs, use plain text with linkification
  if (!runs || runs.length === 0) {
    return <LinkifiedText text={fallbackText} />;
  }

  // Render each run with its formatting
  return (
    <>
      {runs.map((run, index) => {
        const style: React.CSSProperties = {};
        let className = '';

        if (run.bold) {
          className += 'font-bold ';
        }
        if (run.italic) {
          className += 'italic ';
        }
        if ((run as TextRun & { font_color?: string }).font_color) {
          const color = (run as TextRun & { font_color?: string }).font_color;
          style.color = color?.startsWith('#') ? color : `#${color}`;
        }

        return (
          <span key={index} className={className.trim()} style={style}>
            {run.text}
          </span>
        );
      })}
    </>
  );
}

function ListItemComponent({
  item,
  theme,
  size = 'default',
  level = 0,
}: {
  item: ListItem;
  theme: 'light' | 'dark';
  size?: 'default' | 'large' | 'featured';
  level?: number;
}) {
  const textColor = theme === 'dark' ? 'opacity-90' : '';
  const textSize = level > 0 ? 'text-base' : sizeClasses[size]; // Nested items stay smaller

  return (
    <li className={`${textColor} ${textSize} leading-relaxed bullet-item ${level > 0 ? 'bullet-nested' : ''}`} style={{ color: theme === 'dark' ? 'inherit' : 'var(--color-text)' }}>
      <FormattedText runs={item.runs} fallbackText={item.text} />
      {item.children && item.children.length > 0 && (
        <ul className="mt-2 space-y-2 ml-5 bullet-list bullet-list-nested">
          {item.children.map((child, idx) => (
            <ListItemComponent
              key={idx}
              item={child}
              theme={theme}
              size={size}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function BulletList({ content, theme = 'light', size = 'default', noBullets = false }: BulletListProps) {
  const isNumbered = content.style === 'numbered';
  const items = content.items;
  const textSize = sizeClasses[size];

  // If there's only one item with no children, render as plain text
  if (items.length === 1 && (!items[0].children || items[0].children.length === 0)) {
    return (
      <p
        className={`${textSize} leading-relaxed`}
        style={{ color: theme === 'dark' ? 'inherit' : 'var(--color-text)' }}
      >
        <FormattedText runs={items[0].runs} fallbackText={items[0].text} />
      </p>
    );
  }

  // No bullets mode: render as plain paragraphs
  if (noBullets) {
    return (
      <div className="space-y-3">
        {items.map((item, index) => (
          <p
            key={index}
            className={`${textSize} leading-relaxed`}
            style={{ color: theme === 'dark' ? 'inherit' : 'var(--color-text)' }}
          >
            <FormattedText runs={item.runs} fallbackText={item.text} />
          </p>
        ))}
      </div>
    );
  }

  // For multiple items, use proper list
  if (isNumbered) {
    return (
      <ol className="numbered-list space-y-3 ml-5">
        {items.map((item, index) => (
          <ListItemComponent
            key={index}
            item={item}
            theme={theme}
            size={size}
          />
        ))}
      </ol>
    );
  }

  return (
    <ul className={`bullet-list space-y-3 ml-5 ${theme === 'dark' ? 'bullet-list-dark' : ''}`}>
      {items.map((item, index) => (
        <ListItemComponent
          key={index}
          item={item}
          theme={theme}
          size={size}
        />
      ))}
    </ul>
  );
}
