import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { maxDelayMinutes = 30 } = await request.json().catch(() => ({}));

    // Find all bookings where scheduledDate + maxDelayMinutes has passed,
    // AND the worker has not arrived yet (still PENDING, ASSIGNED, or TRAVELLING)
    const expiryTime = new Date(Date.now() - maxDelayMinutes * 60 * 1000);

    const expiredBookings = await db.booking.findMany({
      where: {
        scheduledDate: { lt: expiryTime },
        status: { in: ["PENDING", "ASSIGNED", "TRAVELLING"] },
      },
    });

    if (expiredBookings.length === 0) {
      return NextResponse.json({ success: true, message: "No expired bookings found", reassigned: 0 });
    }

    let reassignedCount = 0;

    // Process each expired booking
    for (const booking of expiredBookings) {
      // Find an alternative verified worker who has the skill for this category
      const alternativeWorker = await db.workerProfile.findFirst({
        where: {
          verificationStatus: "VERIFIED",
          id: { not: booking.workerId || "" }, // Must be a different worker
          skills: { some: { categoryId: booking.categoryId } },
          // Note: In production, check worker availability/schedule here
        },
      });

      if (alternativeWorker) {
        // Reassign the booking
        await db.$transaction(async (tx) => {
          await tx.booking.update({
            where: { id: booking.id },
            data: {
              workerId: alternativeWorker.id,
              status: "ASSIGNED", // Reset status to ASSIGNED for the new worker
            },
          });

          await tx.bookingStatusHistory.create({
            data: {
              bookingId: booking.id,
              status: "REASSIGNED_EXPIRED", // Custom tracking status
            },
          });
        });
        reassignedCount++;
      } else {
        // If no alternative worker is available, mark as cancelled (or you could handle differently)
        await db.$transaction(async (tx) => {
          await tx.booking.update({
            where: { id: booking.id },
            data: { status: "CANCELLED" },
          });
          await tx.bookingStatusHistory.create({
            data: { bookingId: booking.id, status: "CANCELLED_NO_REPLACEMENT" },
          });
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully processed ${expiredBookings.length} delayed bookings. Reassigned: ${reassignedCount}.`,
      reassigned: reassignedCount
    });

  } catch (error) {
    console.error("Reassign workflow error:", error);
    return NextResponse.json({ success: false, error: "Failed to execute reassignment workflow" }, { status: 500 });
  }
}
