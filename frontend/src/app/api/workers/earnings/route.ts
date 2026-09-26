export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'WORKER') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const workerProfile = await db.workerProfile.findUnique({ where: { userId: session.user.id } });
    if (!workerProfile) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    const workerId = workerProfile.id;
    const now = new Date();
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Start of current week (Sunday)
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const payments = await db.payment.findMany({
      where: {
        booking: {
          workerId: workerId
        },
        status: 'SUCCESS'
      },
      include: {
        booking: true
      }
    });

    let todayEarnings = 0;
    let weekEarnings = 0;
    let monthEarnings = 0;
    let totalEarnings = 0;
    
    for (const payment of payments) {
      totalEarnings += payment.amount;
      const paymentDate = new Date(payment.createdAt);
      
      if (paymentDate >= today) {
        todayEarnings += payment.amount;
      }
      if (paymentDate >= weekStart) {
        weekEarnings += payment.amount;
      }
      if (paymentDate >= monthStart) {
        monthEarnings += payment.amount;
      }
    }

    const completedPaidJobs = await db.booking.count({
      where: {
        workerId,
        status: 'PAID'
      }
    });

    const pendingPayments = await db.booking.count({
      where: {
        workerId,
        status: 'COMPLETED' // Completed but not yet paid
      }
    });

    const recentBookings = await db.booking.findMany({
      where: {
        workerId,
        status: 'PAID'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      include: {
        payment: true
      }
    });

    return NextResponse.json({ success: true, data: {
      todayEarnings,
      weekEarnings,
      monthEarnings,
      totalEarnings,
      completedPaidJobs,
      pendingPayments,
      recentBookings
    }});
  } catch (error: any) {
    console.error('Error fetching earnings:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
