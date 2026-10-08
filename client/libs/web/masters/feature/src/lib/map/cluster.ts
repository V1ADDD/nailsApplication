export interface ScreenPoint {
  id: string;
  x: number;
  y: number;
}

export interface PointGroup {
  ids: string[];
  x: number;
  y: number;
}

const clusterRadiusPx = 56;
export const viewportMarginPx = 80;
const noClusterZoom = 18;

function greedyGroups(points: readonly ScreenPoint[], zoom: number, keepApart: string | null): PointGroup[] {
  if (zoom >= noClusterZoom) {
    return points.map((point) => ({ ids: [point.id], x: point.x, y: point.y }));
  }
  const groups: PointGroup[] = [];
  const taken = new Set<string>();
  for (const point of points) {
    if (taken.has(point.id)) {
      continue;
    }
    taken.add(point.id);
    if (point.id === keepApart) {
      groups.push({ ids: [point.id], x: point.x, y: point.y });
      continue;
    }
    const members = [point];
    for (const other of points) {
      if (
        !taken.has(other.id) &&
        other.id !== keepApart &&
        Math.hypot(other.x - point.x, other.y - point.y) <= clusterRadiusPx
      ) {
        taken.add(other.id);
        members.push(other);
      }
    }
    groups.push({
      ids: members.map((member) => member.id),
      x: members.reduce((sum, member) => sum + member.x, 0) / members.length,
      y: members.reduce((sum, member) => sum + member.y, 0) / members.length
    });
  }
  return groups;
}

function merged(first: PointGroup, second: PointGroup): PointGroup {
  const total = first.ids.length + second.ids.length;
  return {
    ids: [...first.ids, ...second.ids],
    x: (first.x * first.ids.length + second.x * second.ids.length) / total,
    y: (first.y * first.ids.length + second.y * second.ids.length) / total
  };
}

export function clusterPoints(points: readonly ScreenPoint[], zoom: number, keepApart: string | null): PointGroup[] {
  const groups = greedyGroups(points, zoom, keepApart);
  if (zoom >= noClusterZoom) {
    return groups;
  }
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < groups.length && !changed; i++) {
      for (let j = i + 1; j < groups.length && !changed; j++) {
        const first = groups[i];
        const second = groups[j];
        if (
          first &&
          second &&
          !first.ids.includes(keepApart ?? '') &&
          !second.ids.includes(keepApart ?? '') &&
          Math.hypot(first.x - second.x, first.y - second.y) <= clusterRadiusPx
        ) {
          groups.splice(j, 1);
          groups[i] = merged(first, second);
          changed = true;
        }
      }
    }
  }
  return groups;
}
