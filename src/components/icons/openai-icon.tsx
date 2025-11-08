import * as React from 'react';
import { cn } from '@/lib/utils';

const OpenAIIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
  ({ className, ...props }, ref) => (
    <svg
      ref={ref}
      className={cn('w-6 h-6', className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M19.351 4.649a1.01 1.01 0 0 0-1.205-.28l-7.92 4.411-2.025 1.124-4.82 2.677a1.01 1.01 0 0 0-.582.91v.003a1.01 1.01 0 0 0 .582.91l4.82 2.678 2.025 1.123 7.92 4.412a1.01 1.01 0 0 0 1.205-.28c.3-.39.363-.902.16-1.36l-1.63-3.621-2.146-4.767 2.146-4.768 1.63-3.62a1.01 1.01 0 0 0-.16-1.361z" />
    </svg>
  )
);

OpenAIIcon.displayName = 'OpenAIIcon';
export { OpenAIIcon };
