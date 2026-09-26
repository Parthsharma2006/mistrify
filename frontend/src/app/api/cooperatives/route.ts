import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cooperatives = await db.cooperative.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, data: cooperatives });
  } catch (error) {
    console.error('Get cooperatives error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cooperatives' },
      { status: 500 }
    );
  }
}
