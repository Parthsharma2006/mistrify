import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const cooperatives = await db.cooperative.findMany({
      include: {
        _count: {
          select: { workers: true }
        }
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: cooperatives.map(coop => ({
        id: coop.id,
        name: coop.name,
        city: coop.city || 'Unknown',
        state: coop.state || 'Unknown',
        workerCount: coop._count.workers,
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to fetch cooperatives' }, { status: 500 });
  }
}
