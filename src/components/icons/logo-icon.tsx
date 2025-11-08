import * as React from 'react';
import { cn } from '@/lib/utils';

const LogoIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
  ({ className, ...props }, ref) => (
    <svg
      ref={ref}
      className={cn('w-6 h-6', className)}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20Z" fill="currentColor"/>
        <path d="M12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16Z" fill="currentColor"/>
        <path d="M13.29 10.71L10.71 13.29C10.53 13.47 10.53 13.77 10.71 13.95C10.8 14.04 10.91 14.09 11.02 14.09C11.13 14.09 11.24 14.04 11.33 13.95L13.95 11.33C14.13 11.15 14.13 10.85 13.95 10.67C13.77 10.49 13.47 10.53 13.29 10.71Z" fill="currentColor"/>
        <path d="M10.05 10.05C9.87 10.23 9.87 10.53 10.05 10.71L12.67 13.33C12.76 13.42 12.87 13.47 12.98 13.47C13.09 13.47 13.2 13.42 13.29 13.33C13.47 13.15 13.47 12.85 13.29 12.67L10.71 10.05C10.53 9.87 10.23 9.87 10.05 10.05Z" fill="currentColor"/>
    </svg>
  )
);

LogoIcon.displayName = 'LogoIcon';
export { LogoIcon };
