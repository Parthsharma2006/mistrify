import { db } from "@/lib/db";
import { calculateDistance } from "@/lib/location";

export async function findMatchingWorkers(
  categoryId: string, 
  subcategoryId: string, 
  customerLat: number, 
  customerLng: number,
  isEmergency: boolean = false
) {
  const workers = await db.workerProfile.findMany({
    where: {
      categoryId,
      verificationStatus: "VERIFIED",
      availabilityStatus: "ONLINE",
      skills: {
        some: {
          subcategoryId
        }
      }
    },
    include: {
      user: { select: { id: true, name: true, profilePhoto: true, mobile: true } },
      skills: { include: { subcategory: true } },
      bookings: {
        where: {
          status: {
            in: ["ASSIGNED", "TRAVELLING", "ARRIVED", "WORKING"]
          }
        }
      }
    }
  });

  const workerIds = workers.map(w => w.id);
  const ratings = await db.rating.groupBy({
    by: ['workerId'],
    where: { workerId: { in: workerIds } },
    _avg: { rating: true }
  });

  const ratingMap = new Map(ratings.map(r => [r.workerId, r._avg.rating || 0]));

  const matchedWorkers = workers.map(w => {
    let distance = null;
    let distancePenalty = 0;
    const matchReasons: string[] = ["✓ Verified", "✓ Correct Skill", "✓ Available"];
    
    if (w.latitude && w.longitude) {
      distance = calculateDistance(customerLat, customerLng, w.latitude, w.longitude);
      // Distance penalty: e.g. 5 points per km
      distancePenalty = distance * 5;
      matchReasons.push(`✓ ${distance.toFixed(1)} km away`);
    } else {
      distancePenalty = 50;
    }
    
    // Rating bonus
    const avgRating = ratingMap.get(w.id) || 4.0; // Assume 4.0 for new workers
    const ratingBonus = avgRating * 10;
    matchReasons.push(`✓ ${avgRating.toFixed(1)}★ Rating`);

    // Welfare Check (Current Workload)
    const activeJobs = w.bookings.length;
    let workloadPenalty = 0;
    let workloadCategory = "Low";
    
    // Avoid assigning jobs to an overworked worker if a suitable free worker is available
    if (activeJobs >= 3) {
      workloadCategory = "Overworked";
      workloadPenalty = 1000; // Heavy penalty to drop them to the bottom
      matchReasons.push(`! High current workload (${activeJobs} active jobs)`);
    } else if (activeJobs > 0) {
      workloadCategory = "Busy";
      workloadPenalty = activeJobs * 50; 
      matchReasons.push(`- Some current workload (${activeJobs} active jobs)`);
    } else {
      workloadCategory = "Free";
      matchReasons.push(`✓ Free (0 active jobs)`);
    }
    
    // Base score 100 + rating bonus - distance - workload penalty
    let score = 100 + ratingBonus - distancePenalty - workloadPenalty;
    
    return {
      id: w.id,
      user: w.user,
      yearsOfExperience: w.yearsOfExperience,
      distance,
      activeJobs,
      workloadCategory,
      avgRating,
      matchReasons,
      score
    };
  });

  // Sort by highest score first
  matchedWorkers.sort((a, b) => b.score - a.score);

  return matchedWorkers;
}
