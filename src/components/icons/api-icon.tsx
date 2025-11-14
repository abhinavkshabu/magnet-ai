import * as React from 'react';
import { cn } from '@/lib/utils';

const ApiIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
  ({ className, ...props }, ref) => (
    <svg
      ref={ref}
      className={cn('w-6 h-6', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
        <path d="m11.5 8.5 3 3-3 3" />
        <path d="m5.5 8.5 3 3-3 3" />
        <path d="m8.5 5.5 3 3-3 3" />
        <path d="m14.5 5.5 3 3-3 3" />
    </svg>
  )
);

ApiIcon.displayName = 'ApiIcon';
export { ApiIcon };
