export const teams = [
  'Product Design',
  'Product Management',
  'Engineering',
] as const;

export type Team = (typeof teams)[number];
