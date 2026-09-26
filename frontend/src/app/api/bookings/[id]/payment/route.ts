import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { getPaymentProvider } from '@/lib/payment';

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

    const booking = await db.booking.findUnique({
      where: { id },
      include: {
        customer: true,
        worker: true,
        payment: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    if (booking.customer.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Only the customer can pay' }, { status: 403 });
    }

    if (booking.status !== 'COMPLETED') {
      return NextResponse.json({ success: false, error: 'Booking must be COMPLETED to pay' }, { status: 400 });
    }

    if (booking.payment && booking.payment.status === 'SUCCESS') {
      return NextResponse.json({ success: false, error: 'Booking is already paid' }, { status: 400 });
    }

    const amount = booking.finalAmount || booking.price || 0;
    const provider = getPaymentProvider();
    const result = await provider.processPayment(amount, { bookingId: id });

    const payment = await db.payment.create({
      data: {
        bookingId: id,
        customerId: booking.customerId,
        workerId: booking.workerId || '',
        amount,
        status: result.success ? 'SUCCESS' : 'FAILED',
        paymentReference: result.reference,
        paymentMethod: result.method,
      },
    });

    if (result.success) {
      const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
      await db.invoice.create({
        data: {
          bookingId: id,
          paymentId: payment.id,
          invoiceNumber,
          amount,
        },
      });

      await db.booking.update({
        where: { id },
        data: {
          status: 'PAID',
          statusHistory: {
            create: { status: 'PAID' }
          }
        },
      });
    }

    return NextResponse.json({ success: true, data: payment, paymentError: result.error });
  } catch (error) {
    console.error('Error processing payment:', error);
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
      include: { payment: true, customer: true, worker: true },
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

    return NextResponse.json({ success: true, data: booking.payment });
  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

