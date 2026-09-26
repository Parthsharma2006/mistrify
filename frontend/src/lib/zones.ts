import { db } from "@/lib/db";
import { calculateDistance } from "@/lib/location";

export async function findNearestZone(lat: number, lng: number) {
  const zones = await db.serviceZone.findMany();
  let nearest = null;
  let minDistance = Infinity;

  for (const zone of zones) {
    const d = calculateDistance(lat, lng, zone.latitude, zone.longitude);
    if (d < minDistance) {
      minDistance = d;
      nearest = zone;
    }
  }

  return nearest;
}
