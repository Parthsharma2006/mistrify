import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateDemandInsights } from "@/lib/ai";

export async function GET() {
  try {
    const totalWorkers = await db.workerProfile.count();
    const zoneCounts = await db.serviceZone.count();
    const openComplaints = await db.complaint.count({
      where: { status: "OPEN" },
    });

    const bookingsByCategory = await db.booking.groupBy({
      by: ["categoryId"],
      _count: {
        id: true,
      },
    });

    const categories = await db.serviceCategory.findMany({
      where: { id: { in: bookingsByCategory.map((b) => b.categoryId) } },
      select: { id: true, name: true },
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    const bookingStats = bookingsByCategory.map((b) => ({
      category: categoryMap.get(b.categoryId) || "Unknown",
      count: b._count.id,
    }));

    const stats = {
      totalWorkers,
      totalZones: zoneCounts,
      openComplaints,
      bookingsByCategory: bookingStats,
    };

    const insights = await generateDemandInsights(stats);

    return NextResponse.json({ success: true, data: { insights } });
  } catch (error) {
    console.error("Error in ai-insights route:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch AI insights" },
      { status: 500 }
    );
  }
}
