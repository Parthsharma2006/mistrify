export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role;
    if (userRole !== 'WORKER') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const userId = session.user.id;
    const workerProfile = await db.workerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, name: true, mobile: true, email: true, profilePhoto: true, preferredLanguage: true, createdAt: true }
        },
        category: true,
        cooperative: true,
        skills: {
          include: {
            subcategory: true
          }
        },
        portfolio: true,
        bookings: {
          where: {
            createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }
        }
      }
    });

    if (!workerProfile) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }

    const completedBookings = await db.booking.findMany({
      where: { workerId: workerProfile.id, status: 'COMPLETED' },
      include: { payment: true }
    });
    
    let totalEarnings = 0;
    completedBookings.forEach(b => {
      if (b.payment && b.payment.status === 'SUCCESS') {
        totalEarnings += b.payment.amount;
      }
    });
    
    const reviews = await db.review.findMany({ where: { workerId: workerProfile.id } });
    const rating = reviews.length > 0 ? reviews.reduce((acc: number, r: any) => acc + (r as any).rating, 0) / reviews.length : null;

    const enrichedProfile = {
      ...workerProfile,
      totalEarnings,
      completedJobs: completedBookings.length,
      rating,
    };

    return NextResponse.json({ success: true, data: enrichedProfile });
  } catch (error) {
    console.error('Get worker profile error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch profile' }, { status: 500 });
  }
}

const updateWorkerSchema = z.object({
  bio: z.string().max(500).optional(),
  yearsOfExperience: z.number().min(0).max(50).optional(),
  availabilityStatus: z.enum(['ONLINE', 'OFFLINE', 'BUSY']).optional(),
});

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role;
    if (userRole !== 'WORKER') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const validated = updateWorkerSchema.parse(body);

    const profile = await db.workerProfile.update({
      where: { userId },
      data: validated,
    });

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error('Update worker profile error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 });
  }
}
