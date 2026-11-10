import React from 'react';

export const COMPANY_LOGO_URL = '/assets/aistudio/file_00000000f7c481f4b49aed422b313c74_491e5797.png';
export const APP_LOGO_URL = '/assets/aistudio/file_000000005af0824382d688b64855f354_8341628d.png';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  variant?: 'light' | 'dark' | 'color';
  logoType?: 'company' | 'app';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  showTagline = false,
  variant = 'color',
  logoType = 'company',
}) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  const imageSrc = logoType === 'app' ? APP_LOGO_URL : COMPANY_LOGO_URL;

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div
        className={`${iconSizes[size]} shrink-0 relative flex items-center justify-center overflow-hidden rounded-xl bg-white border border-slate-200/80 shadow-2xs p-0.5`}
      >
        <img
          src={imageSrc}
          alt="AIConsults Logo"
          className={`w-full h-full object-contain ${
            logoType === 'company' ? 'scale-125' : 'scale-105'
          }`}
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center">
            <span
              className={`font-extrabold tracking-tight ${textSizes[size]} ${
                variant === 'dark' ? 'text-white' : 'text-[#0B192C]'
              }`}
            >
              AIConsults
            </span>
          </div>

          {showTagline && (
            <span className="text-[10px] font-medium tracking-wider text-slate-400 mt-0.5">
              Plan · Organize · Achieve
            </span>
          )}
        </div>
      )}
    </div>
  );
};
