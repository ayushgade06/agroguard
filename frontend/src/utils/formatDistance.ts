export function formatDistance(distance_km?: number) {
  if (!distance_km) return null;

  return distance_km < 1
    ? `${Math.round(distance_km * 1000)} meters`
    : `${distance_km.toFixed(2)} km`;
}
