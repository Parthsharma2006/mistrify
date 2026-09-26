import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { bookingId, rating, comment } = await request.json();

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true, worker: true }
    });

    if (!booking) return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });

    // Check if review already exists
    const existing = await db.review.findFirst({
      where: { bookingId }
    });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Already reviewed' }, { status: 400 });
    }

    const review = await db.review.create({
      data: {
        bookingId,
        customerId: booking.customerId,
        workerId: booking.workerId as string,
        rating,
        comment: comment || ""
      }
    });

    // Notify worker
    await db.notification.create({
      data: {
        userId: booking.worker?.userId as string,
        type: 'SYSTEM',
        title: 'New Review!',
        message: `You received a ${rating}-star review from a customer.`,
        isRead: false
      }
    });

    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    console.error('Review error:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit review' }, { status: 500 });
  }
}
