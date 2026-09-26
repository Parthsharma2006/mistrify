import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { rating, quality, professionalism, timeliness, feedback } = body;

    const booking = await db.booking.findUnique({
      where: { id },
      include: { rating: true },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    if (booking.customerId !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Only customer can rate' }, { status: 403 });
    }

    if (booking.status !== 'COMPLETED' && booking.status !== 'PAID') {
      return NextResponse.json({ success: false, error: 'Booking must be COMPLETED or PAID to rate' }, { status: 400 });
    }

    if (booking.rating) {
      return NextResponse.json({ success: false, error: 'Rating already exists' }, { status: 400 });
    }

    const newRating = await db.rating.create({
      data: {
        bookingId: id,
        workerId: booking.workerId!,
        customerId: session.user.id,
        rating,
        quality,
        professionalism,
        timeliness,
        feedback,
      },
    });

    return NextResponse.json({ success: true, data: newRating });
  } catch (error: any) {
    console.error('Error creating rating:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const booking = await db.booking.findUnique({
      where: { id },
      include: { rating: true },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: booking.rating });
  } catch (error: any) {
    console.error('Error fetching rating:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
