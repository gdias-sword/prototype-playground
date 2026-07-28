export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function toPascal(value: string): string {
  const words = value.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  if (words.length === 0) {
    return '';
  }
  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

export function isSafePathSegment(segment: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(segment);
}
