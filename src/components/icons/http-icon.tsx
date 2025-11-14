import * as React from 'react';
import { cn } from '@/lib/utils';

const HttpIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
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
        <text x="5" y="16" fontFamily="monospace" fontSize="8" fill="currentColor" stroke="none">HTTP</text>
    </svg>
  )
);

HttpIcon.displayName = 'HttpIcon';
export { HttpIcon };
