const hourMs = 3_600_000;
const shortLeadHours = 2;
const longLeadHours = 24;

export function pendingReleaseAt(start: Date, createdAt: Date): Date {
  const lead = start.getTime() - createdAt.getTime();
  if (lead <= shortLeadHours * hourMs) {
    return start;
  }
  return new Date(start.getTime() - (lead > longLeadHours * hourMs ? longLeadHours : shortLeadHours) * hourMs);
}
