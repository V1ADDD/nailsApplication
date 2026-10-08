export const mastersPath = '/api/masters';
export const myMasterPath = `${mastersPath}/me`;
export const myOffersPath = `${myMasterPath}/offers`;

export function masterPath(id: string): string {
  return `${mastersPath}/${encodeURIComponent(id)}`;
}

export function myOfferPath(id: string): string {
  return `${myOffersPath}/${encodeURIComponent(id)}`;
}
