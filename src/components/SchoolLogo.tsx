import React from 'react';

interface SchoolLogoProps {
  variant?: 'full' | 'icon' | 'horizontal' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isDark?: boolean;
  customLogoUrl?: string;
  schoolName?: string;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  isDark = false,
  customLogoUrl,
  schoolName = 'المدرسة الدولية',
}) => {
  // Dimension mapping
  const iconDimensions = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const DefaultEmblemSVG = ({ className = 'w-full h-full' }: { className?: string }) => (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} drop-shadow-xs`}
    >
      {/* Outer Purple Arc Swoosh */}
      <path
        d="M 68 85 C 65 52, 90 28, 126 38 C 142 43, 150 56, 150 56 C 150 56, 134 46, 120 44 C 92 40, 74 60, 78 84 Z"
        fill="#1E40AF"
      />
      {/* Graduation Mortarboard Cap */}
      <path
        d="M 108 45 L 126 39 L 144 45 L 126 51 Z"
        fill="#1D4ED8"
      />
      <path
        d="M 126 49 L 126 55 C 126 56.5, 131 57.5, 136 56 L 136 50 Z"
        fill="#1E3A8A"
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
      {/* Stylized Student Body */}
      <path
        d="M 104 57 C 111 70, 114 82, 116 116 C 118 126, 124 140, 126 148 C 124 140, 119 133, 117 122 C 114 106, 102 96, 94 92 C 100 88, 110 82, 113 74 Z"
        fill="#2563EB"
      />
      <path
        d="M 126 74 C 130 82, 138 90, 148 94 C 142 98, 134 105, 131 120 C 129 131, 126 142, 124 148 C 126 138, 132 125, 135 116 C 137 82, 140 70, 147 57 Z"
        fill="#3B82F6"
      />
      {/* Golden Book Swoosh */}
      <path
        d="M 60 72 C 75 78, 92 89, 106 99 C 94 93, 76 84, 62 82 C 57 88, 62 96, 75 102 C 88 108, 102 114, 108 116 C 96 110, 80 102, 68 98 C 62 104, 70 114, 88 122 C 98 126, 106 130, 115 133 C 103 126, 92 120, 80 114 C 74 122, 85 132, 105 140 C 111 138, 116 130, 124 148 C 112 144, 98 135, 88 126 Z"
        fill="#F59E0B"
      />
    </svg>
  );

  const RenderLogoMedia = ({ className = 'w-full h-full' }: { className?: string }) => {
    if (customLogoUrl) {
      return (
        <img
          src={customLogoUrl}
          alt={schoolName}
          className={`${className} object-contain rounded-lg`}
          onError={(e) => {
            // Fallback on broken URL
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    }
    return <DefaultEmblemSVG className={className} />;
  };

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${iconDimensions[size]} ${className}`}>
        <RenderLogoMedia />
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2 p-1.5 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-blue-50/80 border border-blue-100'} ${className}`}>
        <div className={iconDimensions[size]}>
          <RenderLogoMedia />
        </div>
        <div className="text-right leading-tight">
          <div className={`font-black text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {schoolName}
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
          <RenderLogoMedia />
        </div>

        {/* Brand Text Stack */}
        <div className="mt-2 space-y-0.5">
          <div className={`font-extrabold tracking-wide text-sm sm:text-base ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
            International School
          </div>
          <div className={`font-black text-base sm:text-lg tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
            {schoolName}
          </div>
          <div className={`text-[11px] font-bold tracking-tight ${isDark ? 'text-blue-200' : 'text-slate-600'}`}>
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
        <RenderLogoMedia />
      </div>
      <div className="text-right flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <span className={`font-black text-sm sm:text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {schoolName}
          </span>
          <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${isDark ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-amber-100 text-amber-800'}`}>
            International
          </span>
        </div>
        <div className={`text-[11px] font-bold ${isDark ? 'text-slate-300' : 'text-blue-700'}`}>
          نظام الإدارة المدرسية المتطور
        </div>
      </div>
    </div>
  );
};

/**
 * Developer Credit Emblem & Badge:
 * Represents "برمجة المهندس محمود العبدالله" (أبو أنس الحكيم)
 * with the computer / code setup and contact number.
 */
export const DeveloperBadge: React.FC<{
  variant?: 'compact' | 'card' | 'footer';
  className?: string;
}> = ({ variant = 'compact', className = '' }) => {
  if (variant === 'card') {
    return (
      <div className={`bg-gradient-to-br from-[#0F2038] via-[#091527] to-[#040B15] text-white p-4 sm:p-5 rounded-3xl border border-amber-500/30 shadow-lg relative overflow-hidden ${className}`}>
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-right">
            {/* Golden PC & Code Icon */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-md shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-[#081220] rounded-[14px] flex items-center justify-center text-amber-400">
                <span className="font-mono font-black text-lg tracking-tighter">&lt;/&gt;</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-400/30">
                  تطوير وبرمجة مخصصة
                </span>
                <span className="text-[11px] text-slate-400">أبو أنس الحكيم</span>
              </div>
              <h4 className="text-base sm:text-lg font-black text-white mt-0.5 tracking-tight">
                برمجة المهندس محمود العبدالله
              </h4>
              <p className="text-xs text-slate-300 font-medium">
                تطوير الأنظمة البرمجية والإدارية المتكاملة
              </p>
            </div>
          </div>

          {/* Contact Badge */}
          <a
            href="tel:+963939841552"
            dir="ltr"
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-md transition-all shrink-0 hover:scale-105"
          >
            <span className="w-2 h-2 rounded-full bg-slate-950 animate-pulse"></span>
            <span>+963 939 841 552</span>
          </a>
        </div>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={`inline-flex items-center gap-2 text-xs ${className}`}>
        <span className="text-slate-400">برمجة وتطوير:</span>
        <span className="font-bold text-slate-800">المهندس محمود العبدالله</span>
        <span className="text-amber-600 font-bold">(أبو أنس الحكيم)</span>
        <a 
          href="tel:+963939841552" 
          dir="ltr" 
          className="text-blue-600 hover:underline font-mono text-[11px] font-bold"
        >
          +963 939 841 552
        </a>
      </div>
    );
  }

  // Compact badge
  return (
    <div className={`inline-flex items-center gap-2 bg-[#091527] border border-amber-400/30 rounded-xl px-2.5 py-1 text-white text-[11px] shadow-xs ${className}`}>
      <span className="w-5 h-5 rounded-md bg-amber-400/20 text-amber-300 flex items-center justify-center font-mono font-bold text-[10px]">
        &lt;/&gt;
      </span>
      <div className="flex flex-col text-right leading-tight">
        <span className="font-bold text-white">برمجة المهندس محمود العبدالله</span>
        <span className="text-[9px] text-amber-300" dir="ltr">+963 939 841 552</span>
      </div>
    </div>
  );
};
