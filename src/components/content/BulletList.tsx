import type { ListContent, ListItem } from '../../data/types';
import LinkifiedText from './LinkifiedText';

interface BulletListProps {
  content: ListContent;
  theme?: 'light' | 'dark';
}

function ListItemComponent({
  item,
  theme,
  level = 0,
}: {
  item: ListItem;
  theme: 'light' | 'dark';
  level?: number;
}) {
  const textColor = theme === 'dark' ? 'opacity-90' : '';

  return (
    <li className={`${textColor} leading-relaxed bullet-item ${level > 0 ? 'bullet-nested' : ''}`} style={{ color: theme === 'dark' ? 'inherit' : 'var(--color-text)' }}>
      <LinkifiedText text={item.text} />
      {item.children && item.children.length > 0 && (
        <ul className="mt-2 space-y-2 ml-5 bullet-list bullet-list-nested">
          {item.children.map((child, idx) => (
            <ListItemComponent
              key={idx}
              item={child}
              theme={theme}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function BulletList({ content, theme = 'light' }: BulletListProps) {
  const isNumbered = content.style === 'numbered';
  const items = content.items;

  // If there's only one item with no children, render as plain text
  if (items.length === 1 && (!items[0].children || items[0].children.length === 0)) {
    return (
      <p
        className="leading-relaxed"
        style={{ color: theme === 'dark' ? 'inherit' : 'var(--color-text)' }}
      >
        <LinkifiedText text={items[0].text} />
      </p>
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
        />
      ))}
    </ul>
  );
}
