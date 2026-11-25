export const products = ['thrive', 'bloom', 'pulse'] as const;

export type Product = (typeof products)[number];

export const labels: Record<Product, string> = {
  thrive: 'Thrive',
  bloom: 'Bloom',
  pulse: 'Pulse',
};

export function isProduct(value: unknown): value is Product {
  return (
    typeof value === 'string' && (products as readonly string[]).includes(value)
  );
}
