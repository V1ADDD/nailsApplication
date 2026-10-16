export const profilePaths = {
  client: 'client',
  master: 'master',
  settings: 'settings'
} as const;

export const legacyTabParameter = 'tab';

export function profileLink(side: 'client' | 'master'): string {
  return `/profile/${profilePaths[side]}`;
}
