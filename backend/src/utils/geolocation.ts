/**
 * Calcula la distancia entre dos puntos en metros usando la fórmula del haversine
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Verifica si un punto está dentro del radio de otro
 */
export function isWithinRadius(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  radiusMeters: number,
): boolean {
  const distance = calculateDistance(lat1, lon1, lat2, lon2);
  return distance <= radiusMeters;
}

/**
 * Valida si las coordenadas son válidas
 */
export function isValidCoordinates(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
): boolean {
  if (latitude === null || latitude === undefined) return false;
  if (longitude === null || longitude === undefined) return false;
  if (isNaN(latitude) || isNaN(longitude)) return false;
  if (latitude < -90 || latitude > 90) return false;
  if (longitude < -180 || longitude > 180) return false;
  return true;
}

/**
 * Obtiene la precisión de GPS en texto
 */
export function getGpsPrecisionLabel(accuracy: number | null): {
  label: string;
  color: string;
} {
  if (accuracy === null || accuracy === undefined) {
    return { label: 'No disponible', color: 'bg-gray-100 text-gray-500' };
  }

  if (accuracy <= 5) {
    return { label: 'Excelente', color: 'bg-green-100 text-green-700' };
  }

  if (accuracy <= 15) {
    return { label: 'Buena', color: 'bg-blue-100 text-blue-700' };
  }

  if (accuracy <= 30) {
    return { label: 'Regular', color: 'bg-yellow-100 text-yellow-700' };
  }

  return { label: 'Baja', color: 'bg-red-100 text-red-700' };
}
