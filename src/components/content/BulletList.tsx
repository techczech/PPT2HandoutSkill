import type { ListContent, ListItem } from '../../data/types';

interface BulletListProps {
  content: ListContent;
  theme?: 'light' | 'dark';
}

function ListItemComponent({
  item,
  theme,
}: {
  item: ListItem;
  theme: 'light' | 'dark';
}) {
  const textColor = theme === 'dark' ? 'opacity-90' : '';

  return (
    <li className={`${textColor} leading-relaxed`} style={{ color: theme === 'dark' ? 'inherit' : 'var(--color-text)' }}>
      <span>{item.text}</span>
      {item.children && item.children.length > 0 && (
        <ul className="mt-2 list-disc list-outside space-y-2 ml-5">
          {item.children.map((child, idx) => (
            <ListItemComponent
              key={idx}
              item={child}
              theme={theme}
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
        {items[0].text}
      </p>
    );
  }

  // For multiple items, use proper list
  if (isNumbered) {
    return (
      <ol className="list-decimal list-outside space-y-3 ml-5">
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
    <ul className="list-disc list-outside space-y-3 ml-5">
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
