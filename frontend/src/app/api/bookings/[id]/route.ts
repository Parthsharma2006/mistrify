import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const booking = await db.booking.findUnique({
      where: { id: (await params).id },
      include: {
        customer: { include: { user: { select: { id: true, name: true, mobile: true } } } },
        worker: { include: { user: { select: { id: true, name: true, mobile: true, profilePhoto: true } }, cooperative: true } },
        category: { select: { name: true } },
        subcategory: { select: { name: true } },
        statusHistory: { orderBy: { timestamp: "asc" } },
        payment: true,
        invoice: true,
        rating: true,
        evidence: { orderBy: { createdAt: "asc" } },
        complaint: true,
      }
    });

    if (!booking) return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });

    // Validate ownership
    if (session.user.role === "CUSTOMER" && booking.customer.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role === "WORKER" && (!booking.worker || booking.worker.userId !== session.user.id)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error("Fetch booking error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch booking" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { status, finalAmount } = body;

    const booking = await db.booking.findUnique({
      where: { id: (await params).id },
      include: { customer: true, worker: true, category: true }
    });

    if (!booking) return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });

    // Validate ownership
    if (session.user.role === "CUSTOMER" && booking.customer.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role === "WORKER" && (!booking.worker || booking.worker.userId !== session.user.id)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Role specific allowed statuses
    if (session.user.role === "CUSTOMER" && status !== "CANCELLED") {
      return NextResponse.json({ success: false, error: "Customers can only cancel" }, { status: 403 });
    }

    const updateData: any = {
      status,
      statusHistory: {
        create: { status }
      }
    };

    // If worker is completing and providing final amount
    if (status === "COMPLETED" && finalAmount !== undefined) {
      updateData.finalAmount = finalAmount;
    }

    const updated = await db.booking.update({
      where: { id: (await params).id },
      data: updateData
    });

    // Create notification based on status
    let notificationTitle = "";
    let notificationMessage = "";
    let targetUserId = "";

    if (status === "ACCEPTED") {
      notificationTitle = "Booking Accepted";
      notificationMessage = `Your booking for ${booking.category.name} has been accepted by the worker.`;
      targetUserId = booking.customer.userId;
    } else if (status === "ON_THE_WAY") {
      notificationTitle = "Worker On The Way";
      notificationMessage = `The worker is on the way to your location.`;
      targetUserId = booking.customer.userId;
    } else if (status === "COMPLETED") {
      notificationTitle = "Booking Completed";
      notificationMessage = `Your booking has been marked as completed.`;
      targetUserId = booking.customer.userId;
    } else if (status === "CANCELLED") {
      if (session.user.role === "CUSTOMER") {
        notificationTitle = "Booking Cancelled";
        notificationMessage = `The customer has cancelled the booking.`;
        targetUserId = booking.worker?.userId || "";
      } else {
        notificationTitle = "Booking Cancelled";
        notificationMessage = `The worker has cancelled the booking.`;
        targetUserId = booking.customer.userId;
      }
    }

    if (notificationTitle && targetUserId) {
      await db.notification.create({
        data: {
          userId: targetUserId,
          title: notificationTitle,
          message: notificationMessage,
          type: "INFO"
        }
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update booking error:", error);
    return NextResponse.json({ success: false, error: "Failed to update booking" }, { status: 500 });
  }
}