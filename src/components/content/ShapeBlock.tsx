import type { ShapeContent } from '../../data/types';

interface ShapeBlockProps {
  content: ShapeContent;
}

// Map shape types to SVG renders
function renderShape(shapeType: string, fillColor: string) {
  // Convert hex color to CSS format
  const color = fillColor.startsWith('#') ? fillColor : `#${fillColor}`;

  // Handle different shape types
  if (shapeType.includes('not_equal') || shapeType.includes('notEqual')) {
    // Not equal symbol ≠
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Top diagonal line (the slash through equals) */}
        <line
          x1="20" y1="80"
          x2="80" y2="20"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Top horizontal line */}
        <line
          x1="15" y1="35"
          x2="85" y2="35"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Bottom horizontal line */}
        <line
          x1="15" y1="65"
          x2="85" y2="65"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (shapeType.includes('equal')) {
    // Equal symbol =
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <line x1="15" y1="35" x2="85" y2="35" stroke={color} strokeWidth="12" strokeLinecap="round" />
        <line x1="15" y1="65" x2="85" y2="65" stroke={color} strokeWidth="12" strokeLinecap="round" />
      </svg>
    );
  }

  if (shapeType.includes('plus') || shapeType.includes('add')) {
    // Plus symbol +
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <line x1="50" y1="15" x2="50" y2="85" stroke={color} strokeWidth="12" strokeLinecap="round" />
        <line x1="15" y1="50" x2="85" y2="50" stroke={color} strokeWidth="12" strokeLinecap="round" />
      </svg>
    );
  }

  if (shapeType.includes('minus') || shapeType.includes('subtract')) {
    // Minus symbol -
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <line x1="15" y1="50" x2="85" y2="50" stroke={color} strokeWidth="12" strokeLinecap="round" />
      </svg>
    );
  }

  if (shapeType.includes('multiply') || shapeType.includes('times')) {
    // Multiply symbol ×
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <line x1="20" y1="20" x2="80" y2="80" stroke={color} strokeWidth="12" strokeLinecap="round" />
        <line x1="80" y1="20" x2="20" y2="80" stroke={color} strokeWidth="12" strokeLinecap="round" />
      </svg>
    );
  }

  if (shapeType.includes('divide')) {
    // Divide symbol ÷
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="25" r="8" fill={color} />
        <line x1="15" y1="50" x2="85" y2="50" stroke={color} strokeWidth="12" strokeLinecap="round" />
        <circle cx="50" cy="75" r="8" fill={color} />
      </svg>
    );
  }

  if (shapeType.includes('arrow_right') || shapeType.includes('rightArrow')) {
    // Right arrow →
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <line x1="10" y1="50" x2="75" y2="50" stroke={color} strokeWidth="10" strokeLinecap="round" />
        <polyline points="60,30 80,50 60,70" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (shapeType.includes('check') || shapeType.includes('checkmark')) {
    // Checkmark ✓
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <polyline points="20,55 40,75 80,25" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // Default: render as a colored rectangle with shape name
  return (
    <div
      className="w-full h-full flex items-center justify-center rounded-lg text-white text-sm font-medium"
      style={{ backgroundColor: color }}
    >
      {shapeType.split(/[_\s(]/)[0]}
    </div>
  );
}

export default function ShapeBlock({ content }: ShapeBlockProps) {
  const fillColor = content.fill_color || '1e3a5f';

  return (
    <div className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 flex-shrink-0">
      {renderShape(content.shape_type, fillColor)}
    </div>
  );
}
