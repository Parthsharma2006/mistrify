import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const customer = await db.customerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer profile not found' }, { status: 404 });
    }

    const data = await req.json();
    const { address, scheduledDate, description, items } = data;

    if (!address || !scheduledDate || !items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Create community request
    const request = await db.communityRequest.create({
      data: {
        customerId: customer.id,
        address,
        scheduledDate: new Date(scheduledDate),
        description,
        items: {
          create: items.map((item: any) => ({
            categoryId: item.categoryId,
            workerCount: item.count,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ success: true, data: request });
  } catch (error) {
    console.error('Community request error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create request' }, { status: 500 });
  }
}
