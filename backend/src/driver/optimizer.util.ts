export type Stop = {
  lat: number;
  lng: number;
  type: 'pickup' | 'dropoff';
  childId: number;
  address: string;
  childName: string;
};

export type DistanceMatrix = {
  durations: number[][]; // seconds
  distances: number[][]; // meters
};

/**
 * Compute a greedy constrained order of stops:
 * - Respect pickup before dropoff for each child
 * - Respect capacity if provided (number of onboard passengers)
 * - Start row index refers to the row in the matrix to use for the first step
 */
export function computeGreedyOrder(
  stops: Stop[],
  matrix: DistanceMatrix | null,
  capacity: number | null,
  startRowIndex: number,
): Stop[] {
  const remaining: Stop[] = [...stops];
  const ordered: Stop[] = [];
  const pickedUpChildren = new Set<number>();
  let onboard = 0;

  const eligible = (s: Stop) => {
    if (s.type === 'dropoff' && !pickedUpChildren.has(s.childId)) return false;
    if (s.type === 'pickup' && capacity != null && onboard >= capacity)
      return false;
    return true;
  };

  let currentRowIndex = startRowIndex;
  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestCost = Number.POSITIVE_INFINITY;
    for (let i = 0; i < remaining.length; i++) {
      const s = remaining[i];
      if (!eligible(s)) continue;
      let cost = Number.POSITIVE_INFINITY;
      if (matrix && matrix.durations[currentRowIndex]) {
        const destIndex = stops.indexOf(s);
        cost =
          matrix.durations[currentRowIndex][destIndex] ??
          Number.POSITIVE_INFINITY;
      } else {
        // fallback pseudo-distance if no matrix
        const prev =
          ordered.length > 0 ? ordered[ordered.length - 1] : remaining[0];
        const dx = prev!.lat - s.lat;
        const dy = prev!.lng - s.lng;
        cost = Math.sqrt(dx * dx + dy * dy);
      }
      if (cost < bestCost) {
        bestCost = cost;
        bestIdx = i;
      }
    }
    const next = remaining.splice(bestIdx, 1)[0];
    ordered.push(next);
    if (next.type === 'pickup') {
      pickedUpChildren.add(next.childId);
      onboard++;
    } else {
      onboard = Math.max(0, onboard - 1);
    }
    if (matrix) currentRowIndex = 1 + stops.indexOf(next);
  }

  return ordered;
}
