export const notesPath = '/api/notes';

export function notePath(id: string): string {
  return `${notesPath}/${encodeURIComponent(id)}`;
}
