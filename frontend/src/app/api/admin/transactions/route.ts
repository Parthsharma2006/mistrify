import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payments = await db.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          include: {
            customer: { include: { user: { select: { name: true, email: true } } } },
            worker: { include: { user: { select: { name: true, email: true } } } }
          }
        }
      }
    });

    const totalPayments = await db.payment.count();
    const totalInvoices = await db.invoice.count();
    const totalRatings = await db.rating.count();
    const totalComplaints = await db.complaint.count();

    return NextResponse.json({ success: true, data: {
      payments,
      counts: {
        payments: totalPayments,
        invoices: totalInvoices,
        ratings: totalRatings,
        complaints: totalComplaints
      }
    }});
  } catch (error: any) {
    console.error('Error fetching admin transactions:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
