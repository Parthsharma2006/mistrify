export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    if (session.user.role !== 'WORKER') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const workerProfile = await db.workerProfile.findUnique({ where: { userId: session.user.id } });
    if (!workerProfile) return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });

    const tasks = await db.booking.findMany({
      where: { workerId: workerProfile.id },
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { include: { user: { select: { name: true, mobile: true } } } },
        category: true,
        subcategory: true,
        payment: true,
      }
    });

    const formattedTasks = tasks.map((task) => ({
      id: task.id,
      customerName: task.customer.user.name,
      customerMobile: task.customer.user.mobile,
      serviceType: task.subcategory.name,
      amount: task.finalAmount || task.price || task.basePrice || 0,
      date: task.scheduledDate.toISOString(),
      status: task.status,
      address: task.address,
      paymentStatus: task.payment?.status || 'PENDING'
    }));

    return NextResponse.json({ success: true, data: formattedTasks });
  } catch (error) {
    console.error('Get worker tasks error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    if (session.user.role !== 'WORKER') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { taskId, action, status } = body;

    let newStatus = status;
    if (action === 'ACCEPT') newStatus = 'TRAVELLING'; // Start journey
    if (action === 'DECLINE') newStatus = 'CANCELLED';

    const updatedTask = await db.booking.update({
      where: { id: taskId },
      data: { status: newStatus }
    });
    
    await db.bookingStatusHistory.create({
      data: {
        bookingId: taskId,
        status: newStatus
      }
    });

    return NextResponse.json({ success: true, data: updatedTask });
  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update task' }, { status: 500 });
  }
}
