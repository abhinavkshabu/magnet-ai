import * as React from 'react';
import { cn } from '@/lib/utils';

const GeminiIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
  ({ className, ...props }, ref) => (
    <svg
      ref={ref}
      className={cn('w-6 h-6', className)}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M9.813 6.938c0-1.844 1.406-3.375 3.375-3.375s3.375 1.531 3.375 3.375-1.531 3.375-3.375 3.375a3.25 3.25 0 01-1.406-.375L9 12l2.781 2.438c.375-.25.875-.375 1.406-.375 1.97 0 3.376 1.53 3.376 3.375s-1.406 3.375-3.375 3.375S9.812 19.28 9.812 17.438a3.25 3.25 0 01.375-1.531L7.5 13.5l2.688-2.344a3.25 3.25 0 01-.375-1.687z"
        fill="currentColor"
      />
    </svg>
  )
);

GeminiIcon.displayName = 'GeminiIcon';
export { GeminiIcon };
