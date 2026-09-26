import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const data = await request.json();
    const { bookingId, amount, customerId, workerId } = data;

    await db.$transaction(async (tx) => {
      // 1. Create Payment Record
      const payment = await tx.payment.create({
        data: {
          bookingId,
          amount: parseFloat(amount),
          customerId,
          workerId: workerId || "unknown", // fallback if workerId isn't passed correctly
          status: "SUCCESS",
          paymentMethod: "UPI",
          paymentReference: "TXN-" + Math.random().toString(36).substring(2, 10).toUpperCase()
        }
      });

      // 2. Automatically generate Invoice
      await tx.invoice.create({
        data: {
          bookingId,
          paymentId: payment.id,
          amount: parseFloat(amount),
          /* @ts-ignore */
        taxAmount: parseFloat(amount) * 0.18, // 18% GST example
          /* @ts-ignore */
        totalAmount: parseFloat(amount) * 1.18,
          status: "PAID",
          invoiceUrl: "/invoices/" + payment.id
        }
      });

      // 3. Mark booking as truly finished if not already
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: "COMPLETED" } // Ensure status is closed
      });

      // 4. Create Notification for Admin
      await tx.notification.create({
        data: {
          userId: (await tx.user.findFirst({ where: { role: 'ADMIN' } }))?.id || 'admin', // Realistically you'd map this to admin users
          title: "Payment Received",
          message: `Payment of ₹${amount} received for Booking #${bookingId.slice(-6).toUpperCase()}. Invoice generated.`,
          type: "PAYMENT",
          isRead: false
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json({ success: false, error: "Payment failed" }, { status: 500 });
  }
}
