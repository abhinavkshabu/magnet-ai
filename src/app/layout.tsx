import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { cn } from '@/lib/utils';
import { GeistSans } from 'geist/font/sans';


export const metadata: Metadata = {
  title: 'Creative Sandbox',
  description: 'Visually create AI and IoT workflows.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(GeistSans.className, 'antialiased bg-background')}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
