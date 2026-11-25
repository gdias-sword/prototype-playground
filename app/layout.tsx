import '@/design/globals.css';
import type { Metadata } from 'next';
import { Figtree, Lora } from 'next/font/google';
import { headers } from 'next/headers';

import { CommentLayer } from '@/components/comments/comment-layer';
import { readPrototypeProduct } from '@/playground/product-theme';

const sans = Figtree({ subsets: ['latin'], variable: '--font-figtree' });

const serif = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
});

export const metadata: Metadata = {
  title: 'Sword Prototype Playground',
  description: 'From idea to live prototype, built on Sword design system.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerStore = await headers();
  const product = readPrototypeProduct(headerStore.get('x-pathname') ?? '');

  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body
        data-product={product}
        className="bg-background-neutral-default text-foreground-neutral-default relative min-h-dvh font-sans antialiased"
      >
        {children}
        <CommentLayer />
      </body>
    </html>
  );
}
