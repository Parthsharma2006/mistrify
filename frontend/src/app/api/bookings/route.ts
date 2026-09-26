export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const role = session.user.role;
    let whereClause = {};

    if (role === "CUSTOMER") {
      const profile = await db.customerProfile.findUnique({ where: { userId: session.user.id } });
      if (!profile) return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
      whereClause = { customerId: profile.id };
    } else if (role === "WORKER") {
      const profile = await db.workerProfile.findUnique({ where: { userId: session.user.id } });
      if (!profile) return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
      whereClause = { workerId: profile.id };
    } else {
      return NextResponse.json({ success: false, error: "Invalid role" }, { status: 403 });
    }

    const bookings = await db.booking.findMany({
      where: whereClause,
      include: {
        customer: { include: { user: { select: { name: true, mobile: true } } } },
        worker: { include: { user: { select: { name: true, mobile: true, profilePhoto: true } } } },
        category: { select: { name: true } },
        subcategory: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    console.error("Fetch bookings error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "CUSTOMER") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const profile = await db.customerProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });

    const data = await request.json();
    const { workerId, categoryId, subcategoryId, address, customerLat, customerLng, scheduledDate, price, isEmergency, basePrice, workloadAdjustment, emergencySurcharge, zoneId } = data;

    const booking = await db.booking.create({
      data: {
        customerId: profile.id,
        workerId,
        categoryId,
        subcategoryId,
        address,
        customerLat,
        customerLng,
        scheduledDate: new Date(scheduledDate),
        price,
        isEmergency: !!isEmergency,
        basePrice,
        workloadAdjustment,
        emergencySurcharge,
        zoneId,
        status: "PENDING",
        statusHistory: {
          create: {
            status: "PENDING"
          }
        }
      }
    });

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json({ success: false, error: "Failed to create booking" }, { status: 500 });
  }
}
