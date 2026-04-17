export interface CursorPage<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
  total?: number;
}

export function encodeCursor(payload: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

export function decodeCursor<T>(cursor: string): T {
  return JSON.parse(Buffer.from(cursor, 'base64url').toString('utf-8')) as T;
}
