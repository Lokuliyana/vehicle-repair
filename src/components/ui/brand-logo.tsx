import React from 'react';
import { clsx } from 'clsx';
import slogoUrl from '@/assets/slogo.svg';

export interface BrandLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'navbar' | 'compact' | 'sidebar' | 'raw';
  alt?: string;
  dataTestId?: string;
  'data-testid'?: string;
  className?: string;
  imgClassName?: string;
}

/**
 * BrandLogo Component
 * Renders the official Antigravity / 500 Labs workshop logo (slogo.svg).
 * Because the logo graphic is white with transparent background, this component
 * wraps it in a tailored high-contrast dark container (slate-950 / obsidian with subtle border)
 * to ensure crystal-clear visibility and premium automotive aesthetic across light & dark surfaces.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'navbar',
  alt = '500 Labs — Antigravity Automotive',
  dataTestId,
  className,
  imgClassName,
  ...rest
}) => {
  const resolvedTestId = rest['data-testid'] || dataTestId || 'brand-logo';

  if (variant === 'raw') {
    return (
      <img
        src={slogoUrl}
        alt={alt}
        className={clsx('h-6 w-auto object-contain drop-shadow-xs select-none', imgClassName, className)}
        data-testid={resolvedTestId}
      />
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={clsx(
          'w-10 h-10 rounded-[10px] bg-slate-950 border border-slate-800/90 flex items-center justify-center p-1.5 shadow-2xs transition-all hover:border-slate-700 select-none',
          className
        )}
        data-testid={resolvedTestId}
      >
        <img
          src={slogoUrl}
          alt={alt}
          className={clsx('w-full h-full object-contain drop-shadow-xs', imgClassName)}
        />
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div
        className={clsx(
          'w-9 h-9 rounded-[9px] bg-slate-950 border border-slate-800/90 flex items-center justify-center p-1 shadow-2xs group-hover:scale-105 transition-transform shrink-0 select-none',
          className
        )}
        data-testid={resolvedTestId}
      >
        <img
          src={slogoUrl}
          alt={alt}
          className={clsx('w-full h-full object-contain drop-shadow-xs', imgClassName)}
        />
      </div>
    );
  }

  // Default 'navbar' variant: sleek horizontal dark capsule that makes the white logo clearly visible
  return (
    <div
      className={clsx(
        'h-9 px-2.5 sm:px-3 rounded-[10px] bg-slate-950 hover:bg-slate-900 border border-slate-800/90 shadow-2xs flex items-center justify-center transition-all group-hover:border-slate-700 select-none',
        className
      )}
      data-testid={resolvedTestId}
      title={alt}
    >
      <img
        src={slogoUrl}
        alt={alt}
        className={clsx(
          'h-5 sm:h-6 w-auto max-w-[90px] sm:max-w-[110px] object-contain drop-shadow-xs',
          imgClassName
        )}
      />
    </div>
  );
};
