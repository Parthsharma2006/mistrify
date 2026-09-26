import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const role = req.nextUrl.searchParams.get('role') || 'WORKER';

  try {
    if (role === 'WORKER') {
      const workers = await db.workerProfile.findMany({
        include: {
          user: { select: { name: true, mobile: true } },
          category: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({
        success: true,
        data: workers.map(w => ({
          id: w.id,
          name: w.user.name,
          mobile: w.user.mobile,
          category: w.category?.name || 'N/A',
          status: w.verificationStatus,
          rating: w.rating,
        })),
      });
    } else {
      const customers = await db.customerProfile.findMany({
        include: {
          user: { select: { name: true, mobile: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({
        success: true,
        data: customers.map(c => ({
          id: c.id,
          name: c.user.name,
          mobile: c.user.mobile,
          city: c.city || '',
        })),
      });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  }
}
