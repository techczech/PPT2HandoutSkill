import type { SmartArtContent, SmartArtNode } from '../../data/types';

interface SmartArtDiagramProps {
  content: SmartArtContent;
  fillSpace?: boolean;
  theme?: 'light' | 'dark';
}

function SmartArtNodeComponent({ node, depth = 0 }: { node: SmartArtNode; depth?: number }) {
  const indentClass = depth > 0 ? 'ml-4' : '';
  const bgClasses = [
    'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300',
    'bg-gradient-to-r from-green-50 to-green-100 border-green-300',
    'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-300',
    'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-300',
  ];
  const bgClass = bgClasses[depth % bgClasses.length];

  return (
    <div className={`${indentClass} space-y-2`}>
      <div className={`smart-art-node ${bgClass} border-l-4`}>
        {node.icon && (
          <img
            src={node.icon}
            alt={node.icon_alt || ''}
            className="w-8 h-8 object-contain shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
        <div className="flex-1">
          {node.text.split('\n').map((line, i) => (
            <p key={i} className={i === 0 ? 'font-medium text-gray-900' : 'text-sm text-gray-600'}>
              {line}
            </p>
          ))}
        </div>
      </div>
      {node.children && node.children.length > 0 && (
        <div className="space-y-2">
          {node.children.map((child) => (
            <SmartArtNodeComponent key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SmartArtDiagram({ content, fillSpace: _fillSpace = false, theme: _theme = 'light' }: SmartArtDiagramProps) {
  if (!content.nodes || content.nodes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 p-2">
      {content.nodes.map((node) => (
        <SmartArtNodeComponent key={node.id} node={node} />
      ))}
    </div>
  );
}
