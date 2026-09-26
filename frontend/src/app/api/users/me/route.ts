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

    const userId = session.user.id;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        mobile: true,
        email: true,
        role: true,
        profilePhoto: true,
        preferredLanguage: true,
        createdAt: true,
        updatedAt: true,
        customerProfile: true,
        workerProfile: {
          include: {
            category: true,
            cooperative: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch user' }, { status: 500 });
  }
}

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional().or(z.literal('')),
  preferredLanguage: z.enum(['en', 'hi']).optional(),
});

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const validated = updateUserSchema.parse(body);

    const user = await db.user.update({
      where: { id: userId },
      data: {
        ...(validated.name && { name: validated.name }),
        ...(validated.email !== undefined && { email: validated.email || null }),
        ...(validated.preferredLanguage && { preferredLanguage: validated.preferredLanguage }),
      },
      select: {
        id: true,
        name: true,
        mobile: true,
        email: true,
        role: true,
        profilePhoto: true,
        preferredLanguage: true,
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error('Update user error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 });
  }
}
