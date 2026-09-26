import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const zones = await db.serviceZone.findMany({
      include: {
        workers: {
          include: {
            user: { select: { name: true } },
            bookings: {
              where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
            }
          }
        },
        bookings: {
          where: { status: { in: ["PENDING", "ACCEPTED", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS"] } }
        }
      }
    });

    const data = zones.map(z => {
      const workerCount = z.workers.length;
      const activeBookings = z.bookings.length;
      const workerShortage = activeBookings > workerCount * 2;
      
      const workersData = z.workers.map(w => ({
        id: w.id,
        name: w.user?.name,
        recentJobs: w.bookings.length,
        workload: w.bookings.length > 10 ? "HIGH" : w.bookings.length > 3 ? "MEDIUM" : "LOW"
      }));

      return {
        id: z.id,
        name: z.name,
        workerCount,
        activeBookings,
        demand: workerShortage ? "HIGH" : activeBookings > workerCount ? "MEDIUM" : "LOW",
        workers: workersData
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Zones fetch error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch zones" }, { status: 500 });
  }
}
