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
    const { category, description, fileUrl } = body;

    const booking = await db.booking.findUnique({
      where: { id },
      include: { complaint: true },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    if (booking.customerId !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Only customer can file a complaint' }, { status: 403 });
    }

    if (booking.status !== 'COMPLETED' && booking.status !== 'PAID') {
      return NextResponse.json({ success: false, error: 'Booking must be COMPLETED or PAID to file complaint' }, { status: 400 });
    }

    if (booking.complaint) {
      return NextResponse.json({ success: false, error: 'Complaint already exists' }, { status: 400 });
    }

    const newComplaint = await db.complaint.create({
      data: {
        bookingId: id,
        customerId: session.user.id,
        category,
        description,
        fileUrl,
        status: 'OPEN',
      },
    });

    return NextResponse.json({ success: true, data: newComplaint });
  } catch (error: any) {
    console.error('Error creating complaint:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
