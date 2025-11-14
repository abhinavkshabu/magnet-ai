import * as React from 'react';
import { cn } from '@/lib/utils';

const FormIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
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
      <path d="M17 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"></path>
      <path d="M9 7h6"></path>
      <path d="M9 11h6"></path>
      <path d="M9 15h4"></path>
    </svg>
  )
);

FormIcon.displayName = 'FormIcon';
export { FormIcon };
