import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role;
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const [totalWorkers, totalCustomers, totalCooperatives, pendingVerifications, activeBookings, emergencyRequests, totalPayments, totalComplaints] =
      await Promise.all([
        db.user.count({ where: { role: 'WORKER' } }),
        db.user.count({ where: { role: 'CUSTOMER' } }),
        db.cooperative.count(),
        db.workerProfile.count({ where: { verificationStatus: 'PENDING' } }),
        db.booking.count({ where: { status: { in: ['PENDING', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'] } } }),
        db.booking.count({ where: { isEmergency: true } }),
        db.payment.count({ where: { status: 'SUCCESS' } }),
        db.complaint.count({ where: { status: 'OPEN' } }),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        totalWorkers,
        totalCustomers,
        totalCooperatives,
        pendingVerifications,
        activeBookings,
        emergencyRequests,
        totalPayments,
        totalComplaints,
      },
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
