import React from 'react';

interface IraqEmblemProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const IraqEmblem: React.FC<IraqEmblemProps> = ({
  className = 'w-10 h-10',
  size = 'md',
}) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  return (
    <div className={`relative shrink-0 flex items-center justify-center ${sizeMap[size] || className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xs"
      >
        {/* Golden Eagle Body / Silhouette */}
        <path
          d="M 50 12 C 55 18, 62 25, 75 22 C 78 30, 80 40, 84 52 C 86 60, 84 72, 78 84 C 74 78, 70 75, 68 78 C 65 83, 62 88, 50 88 C 38 88, 35 83, 32 78 C 30 75, 26 78, 22 84 C 16 72, 14 60, 16 52 C 20 40, 22 30, 25 22 C 38 25, 45 18, 50 12 Z"
          fill="#D4AF37"
        />
        {/* Eagle Head Details */}
        <path
          d="M 50 10 C 52 14, 55 14, 57 18 L 52 19 L 50 22 L 48 19 L 43 18 C 45 14, 48 14, 50 10 Z"
          fill="#B8860B"
        />
        {/* Eagle Wings Detail Highlights */}
        <path
          d="M 28 32 C 36 36, 42 42, 45 50"
          stroke="#996515"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 72 32 C 64 36, 58 42, 55 50"
          stroke="#996515"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Central Shield with Iraqi Flag */}
        <g transform="translate(32, 34)">
          {/* Shield Outline with Golden Border */}
          <path
            d="M 0 4 C 0 0, 36 0, 36 4 L 36 26 C 36 38, 18 46, 18 46 C 18 46, 0 38, 0 26 Z"
            fill="#1E293B"
            stroke="#996515"
            strokeWidth="2"
          />
          {/* Red Stripe (Top) */}
          <path
            d="M 2 4 C 2 3, 34 3, 34 4 L 34 12 L 2 12 Z"
            fill="#CE1126"
          />
          {/* White Stripe (Middle) */}
          <path
            d="M 2 12 L 34 12 L 34 22 L 2 22 Z"
            fill="#FFFFFF"
          />
          {/* Black Stripe (Bottom) */}
          <path
            d="M 2 22 L 34 22 L 34 26 C 34 35, 18 44, 18 44 C 18 44, 2 35, 2 26 Z"
            fill="#000000"
          />
          {/* Arabic Kufic "الله أكبر" in Green in White Stripe */}
          <text
            x="18"
            y="19"
            fontSize="5.5"
            fontWeight="bold"
            fontFamily="'Cairo', sans-serif"
            fill="#007A3D"
            textAnchor="middle"
          >
            الله ★ أكبر
          </text>
        </g>
      </svg>
    </div>
  );
};
