import React from 'react';

interface SchoolLogoProps {
  variant?: 'full' | 'icon' | 'horizontal' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isDark?: boolean;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  isDark = false,
}) => {
  // Dimension mapping
  const iconDimensions = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const EmblemSVG = ({ className = 'w-full h-full' }: { className?: string }) => (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} drop-shadow-xs`}
    >
      {/* Outer Purple Arc Swoosh */}
      <path
        d="M 68 85 C 65 52, 90 28, 126 38 C 142 43, 150 56, 150 56 C 150 56, 134 46, 120 44 C 92 40, 74 60, 78 84 Z"
        fill="#6B21A8"
      />

      {/* Graduation Mortarboard Cap */}
      <path
        d="M 108 45 L 126 39 L 144 45 L 126 51 Z"
        fill="#6B21A8"
      />
      <path
        d="M 126 49 L 126 55 C 126 56.5, 131 57.5, 136 56 L 136 50 Z"
        fill="#581C87"
      />
      {/* Cap Tassel */}
      <path
        d="M 113 47 C 111 50, 110 54, 111 58"
        stroke="#F59E0B"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="111" cy="58" r="1.5" fill="#F59E0B" />

      {/* Golden Head */}
      <circle cx="126" cy="62" r="10" fill="#F59E0B" />

      {/* Stylized Student Body with Raised Arms (Purple) */}
      <path
        d="M 104 57 C 111 70, 114 82, 116 116 C 118 126, 124 140, 126 148 C 124 140, 119 133, 117 122 C 114 106, 102 96, 94 92 C 100 88, 110 82, 113 74 Z"
        fill="#6B21A8"
      />
      <path
        d="M 126 74 C 130 82, 138 90, 148 94 C 142 98, 134 105, 131 120 C 129 131, 126 142, 124 148 C 126 138, 132 125, 135 116 C 137 82, 140 70, 147 57 Z"
        fill="#7E22CE"
      />

      {/* Golden Book Swoosh / Wing Page */}
      <path
        d="M 60 72 C 75 78, 92 89, 106 99 C 94 93, 76 84, 62 82 C 57 88, 62 96, 75 102 C 88 108, 102 114, 108 116 C 96 110, 80 102, 68 98 C 62 104, 70 114, 88 122 C 98 126, 106 130, 115 133 C 103 126, 92 120, 80 114 C 74 122, 85 132, 105 140 C 111 138, 116 130, 124 148 C 112 144, 98 135, 88 126 Z"
        fill="#F59E0B"
      />

      {/* Bottom Purple Wing / Book Swoosh Base */}
      <path
        d="M 58 78 C 70 85, 88 95, 104 106 C 90 98, 70 88, 56 86 C 52 94, 58 104, 72 112 C 86 120, 102 128, 114 134 C 100 126, 82 116, 68 110 C 62 118, 74 130, 96 140 C 105 138, 110 132, 118 152 C 104 147, 88 136, 76 125 C 68 116, 56 104, 54 94 C 52 86, 54 80, 58 78 Z"
        fill="#581C87"
      />
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${iconDimensions[size]} ${className}`}>
        <EmblemSVG />
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2 p-1.5 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-purple-50/80 border border-purple-100'} ${className}`}>
        <div className={iconDimensions[size]}>
          <EmblemSVG />
        </div>
        <div className="text-right leading-tight">
          <div className={`font-black text-xs ${isDark ? 'text-white' : 'text-purple-900'}`}>
            المدرسة الدولية
          </div>
          <div className={`text-[10px] font-bold ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>
            International School
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`}>
        {/* Top Graphic Logo */}
        <div className={iconDimensions[size] || 'w-24 h-24'}>
          <EmblemSVG />
        </div>

        {/* Brand Text Stack */}
        <div className="mt-2 space-y-0.5">
          {/* English */}
          <div className={`font-extrabold tracking-wide text-sm sm:text-base ${isDark ? 'text-purple-300' : 'text-purple-800'}`} style={{ fontFamily: 'sans-serif' }}>
            International School
          </div>
          {/* Arabic Name */}
          <div className={`font-black text-base sm:text-lg tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
            المــدرســة الـدوليـــة
          </div>
          {/* Educational Stages */}
          <div className={`text-[11px] font-bold tracking-tight ${isDark ? 'text-purple-200' : 'text-purple-700'}`}>
            رياض أطفال - إبتدائي - إعدادي - ثانوي
          </div>
        </div>
      </div>
    );
  }

  // Default: Horizontal Banner Layout
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div className={iconDimensions[size]}>
        <EmblemSVG />
      </div>
      <div className="text-right flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <span className={`font-black text-sm sm:text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
            المدرسة الدولية
          </span>
          <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${isDark ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-amber-100 text-amber-800'}`}>
            International
          </span>
        </div>
        <div className={`text-[11px] font-bold ${isDark ? 'text-slate-300' : 'text-purple-800'}`}>
          رياض أطفال • إبتدائي • إعدادي • ثانوي
        </div>
      </div>
    </div>
  );
};
