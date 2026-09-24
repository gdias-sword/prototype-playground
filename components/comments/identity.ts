const AUTHOR_KEY = 'playground-comment-author';
const TOKEN_KEY = 'playground-comment-token';

export function readAuthorName(): string {
  return localStorage.getItem(AUTHOR_KEY) ?? '';
}

export function saveAuthorName(name: string) {
  localStorage.setItem(AUTHOR_KEY, name.trim());
}

export function readCommentToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function ensureCommentToken(): string {
  const existing = localStorage.getItem(TOKEN_KEY);
  if (existing) return existing;
  const token = crypto.randomUUID();
  localStorage.setItem(TOKEN_KEY, token);
  return token;
}
