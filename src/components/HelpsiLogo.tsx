import React from 'react';
import { cn } from '@/lib/utils';

interface HelpsiLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const HelpsiLogo: React.FC<HelpsiLogoProps> = ({ 
  className, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
    xl: 'text-5xl'
  };

  return (
    <div className={cn(
      'flex items-center font-inter font-black tracking-tight select-none',
      sizeClasses[size],
      className
    )}>
      <span className="bg-gradient-primary bg-clip-text text-transparent drop-shadow-sm">
        HELP
      </span>
      <span className="text-white drop-shadow-md">
        SI
      </span>
    </div>
  );
};