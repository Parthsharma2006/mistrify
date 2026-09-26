import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const verificationSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  fileUrl: z.string().url(),
  fileType: z.enum(['IMAGE', 'VIDEO']),
  experienceYears: z.number().int().min(0).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'WORKER') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const userId = session.user.id;
    
    const workerProfile = await db.workerProfile.findUnique({
      where: { userId },
    });

    if (!workerProfile) {
       return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const validated = verificationSchema.parse(body);

    const portfolioItem = await db.portfolioItem.create({
      data: {
        workerId: workerProfile.id,
        title: validated.title,
        description: validated.description,
        fileUrl: validated.fileUrl,
        fileType: validated.fileType,
        experienceYears: validated.experienceYears,
        status: 'PENDING',
      }
    });

    return NextResponse.json({ success: true, data: portfolioItem });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error('Submit verification error:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit verification' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'WORKER') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const userId = session.user.id;
    
    const workerProfile = await db.workerProfile.findUnique({
      where: { userId },
    });

    if (!workerProfile) {
       return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    const portfolioItems = await db.portfolioItem.findMany({
      where: {
        workerId: workerProfile.id,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ success: true, data: portfolioItems });
  } catch (error) {
    console.error('Get verification error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch verification items' }, { status: 500 });
  }
}
