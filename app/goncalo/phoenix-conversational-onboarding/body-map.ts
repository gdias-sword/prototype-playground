export type BodyView = 'front' | 'back';

export type MapZoneId = 'neck' | 'shoulder' | 'arm' | 'back' | 'hip' | 'leg';

export interface MapZone {
  id: MapZoneId;
  label: string;
  leaves: string[];
}

export const MAP_ZONES: MapZone[] = [
  { id: 'neck', label: 'Neck', leaves: ['Neck'] },
  { id: 'shoulder', label: 'Shoulder', leaves: ['Shoulder'] },
  { id: 'arm', label: 'Arm', leaves: ['Elbow', 'Wrist'] },
  { id: 'back', label: 'Back', leaves: ['Back'] },
  { id: 'hip', label: 'Hip', leaves: ['Hip'] },
  { id: 'leg', label: 'Leg', leaves: ['Knee', 'Ankle / Foot'] },
];

export function zoneById(id: MapZoneId) {
  return MAP_ZONES.find((zone) => zone.id === id) ?? MAP_ZONES[0];
}

export function zoneForLeaf(area: string) {
  return MAP_ZONES.find((zone) => zone.leaves.includes(area));
}

export function isZoneSelected(zone: MapZone, selectedAreas: string[]) {
  return zone.leaves.some((leaf) => selectedAreas.includes(leaf));
}

export function clampAreas(selected: string[], maxAreas: number) {
  const unique: string[] = [];
  for (const area of selected) {
    if (!unique.includes(area)) unique.push(area);
    if (unique.length >= maxAreas) break;
  }
  return unique;
}

export function toggleArea(selected: string[], area: string, maxAreas: number) {
  if (selected.includes(area)) return selected.filter((item) => item !== area);
  return clampAreas([...selected, area], maxAreas);
}

export function applyZoneTap(
  selected: string[],
  zone: MapZone,
  maxAreas: number,
): { selected: string[]; drill: MapZoneId | null } {
  if (zone.leaves.length === 1) {
    return {
      selected: toggleArea(selected, zone.leaves[0], maxAreas),
      drill: null,
    };
  }

  return { selected, drill: zone.id };
}
