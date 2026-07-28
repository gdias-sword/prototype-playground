import '@/design/globals.css';
import type { Metadata } from 'next';
import { Figtree } from 'next/font/google';

const font = Figtree({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sword Prototype Playground',
  description: 'A playground for prototyping, powered by Sword',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${font.className} bg-background-neutral-default text-foreground-neutral-default antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
