import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

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
      include: {
        invoice: true,
        payment: true,
        customer: { include: { user: { select: { name: true } } } },
        worker: { include: { user: { select: { name: true } }, cooperative: { select: { name: true } } } },
        category: { select: { name: true } },
        subcategory: { select: { name: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    if (
      session.user.role !== 'ADMIN' &&
      booking.customer.userId !== session.user.id &&
      (!booking.worker || booking.worker.userId !== session.user.id)
    ) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    if (!booking.invoice) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: {
      invoice: booking.invoice,
      customerName: booking.customer.user.name,
      workerName: booking.worker?.user.name || "Unassigned",
      cooperativeName: booking.worker?.cooperative?.name || "Independent",
      category: booking.category.name,
      subcategory: booking.subcategory.name,
      basePrice: booking.basePrice,
      workloadAdjustment: booking.workloadAdjustment,
      emergencySurcharge: booking.emergencySurcharge,
      finalAmount: booking.finalAmount || booking.price,
      isEmergency: booking.isEmergency,
      scheduledDate: booking.scheduledDate,
      paymentStatus: booking.payment?.status,
    }});
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
