import { SVGProps } from 'react';

interface PieceSVGProps extends SVGProps<SVGSVGElement> {
  color: string;
  textColor: string;
  text: string;
  special: 'none' | 'power' | 'bomb';
  strokeWidthSpecial: string;
  glowBlurNormal: string;
  fontSizePiece: string;
}

export const TrianglePiece = ({ 
  color, 
  textColor, 
  text, 
  special, 
  strokeWidthSpecial, 
  glowBlurNormal, 
  fontSizePiece,
  ...props 
}: PieceSVGProps) => (
  <svg viewBox="0 0 100 100" className="piece-svg" {...props}>
    <path 
      fill={color}
      stroke={special === 'power' ? 'white' : special === 'bomb' ? '#fbbf24' : 'none'}
      strokeWidth={special !== 'none' ? strokeWidthSpecial : '0'}
      style={{ filter: `drop-shadow(0 0 ${glowBlurNormal} ${color})` }}
      d="M 53,23.2 L 74.71,60.8 Q 77.71,66 71.71,66 L 28.29,66 Q 22.29,66 25.29,60.8 L 47,23.2 Q 50,18 53,23.2 Z" 
    />
    <text
      x="50"
      y="55"
      textAnchor="middle"
      dominantBaseline="middle"
      fill={textColor}
      className="piece-text"
      style={{ 
        fontSize: fontSizePiece, 
        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
      }}
    >
      {text}
    </text>
  </svg>
);

export const HexagonPiece = ({ 
  color, 
  textColor, 
  text, 
  special, 
  strokeWidthSpecial, 
  glowBlurNormal, 
  fontSizePiece,
  ...props 
}: PieceSVGProps) => (
  <svg viewBox="0 0 100 100" className="piece-svg hexagon-scale" {...props}>
    <path 
      fill={color}
      stroke={special === 'power' ? 'white' : special === 'bomb' ? '#fbbf24' : 'none'}
      strokeWidth={special !== 'none' ? strokeWidthSpecial : '0'}
      style={{ filter: `drop-shadow(0 0 ${glowBlurNormal} ${color})` }}
      d="M 54.33,20.5 L 73.38,31.5 Q 77.71,34 77.71,39 L 77.71,61 Q 77.71,66 73.38,68.5 L 54.33,79.5 Q 50,82 45.67,79.5 L 26.62,68.5 Q 22.29,66 22.29,61 L 22.29,39 Q 22.29,34 26.62,31.5 L 45.67,20.5 Q 50,18 54.33,20.5 Z" 
    />
    <text
      x="50"
      y="55"
      textAnchor="middle"
      dominantBaseline="middle"
      fill={textColor}
      className="piece-text"
      style={{ 
        fontSize: fontSizePiece, 
        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
      }}
    >
      {text}
    </text>
  </svg>
);

export const RectanglePiece = ({ 
  color, 
  textColor, 
  text, 
  special, 
  strokeWidthSpecial, 
  glowBlurNormal, 
  fontSizePiece,
  ...props 
}: PieceSVGProps) => (
  <svg viewBox="0 0 100 100" className="piece-svg" {...props}>
    <rect 
      x="22.5" y="22.5" width="55" height="55" rx="12"
      fill={color}
      stroke={special === 'power' ? 'white' : special === 'bomb' ? '#fbbf24' : 'none'}
      strokeWidth={special !== 'none' ? strokeWidthSpecial : '0'}
      style={{ filter: `drop-shadow(0 0 ${glowBlurNormal} ${color})` }}
    />
    <text
      x="50"
      y="55"
      textAnchor="middle"
      dominantBaseline="middle"
      fill={textColor}
      className="piece-text"
      style={{ 
        fontSize: fontSizePiece, 
        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
      }}
    >
      {text}
    </text>
  </svg>
);

export const DiamondPiece = ({ 
  color, 
  textColor, 
  text, 
  special, 
  strokeWidthSpecial, 
  glowBlurNormal, 
  fontSizePiece,
  ...props 
}: PieceSVGProps) => (
  <svg viewBox="0 0 100 100" className="piece-svg" {...props}>
    <rect 
      x="25" y="25" width="50" height="50" rx="8" transform="rotate(45 50 50)"
      fill={color}
      stroke={special === 'power' ? 'white' : special === 'bomb' ? '#fbbf24' : 'none'}
      strokeWidth={special !== 'none' ? strokeWidthSpecial : '0'}
      style={{ filter: `drop-shadow(0 0 ${glowBlurNormal} ${color})` }}
    />
    <text
      x="50"
      y="55"
      textAnchor="middle"
      dominantBaseline="middle"
      fill={textColor}
      className="piece-text"
      style={{ 
        fontSize: fontSizePiece, 
        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
      }}
    >
      {text}
    </text>
  </svg>
);

export const CirclePiece = ({ 
  color, 
  textColor, 
  text, 
  special, 
  strokeWidthSpecial, 
  glowBlurNormal, 
  fontSizePiece,
  ...props 
}: PieceSVGProps) => (
  <svg viewBox="0 0 100 100" className="piece-svg" {...props}>
    <circle 
      cx="50" cy="50" r="30"
      fill={color}
      stroke={special === 'power' ? 'white' : special === 'bomb' ? '#fbbf24' : 'none'}
      strokeWidth={special !== 'none' ? strokeWidthSpecial : '0'}
      style={{ filter: `drop-shadow(0 0 ${glowBlurNormal} ${color})` }}
    />
    <text
      x="50"
      y="55"
      textAnchor="middle"
      dominantBaseline="middle"
      fill={textColor}
      className="piece-text"
      style={{ 
        fontSize: fontSizePiece, 
        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
      }}
    >
      {text}
    </text>
  </svg>
);
