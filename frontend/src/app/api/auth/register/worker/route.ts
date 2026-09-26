import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { z } from 'zod';

const workerRegisterSchema = z.object({
  name: z.string().min(2).max(100),
  mobile: z.string().min(10).max(15).regex(/^[0-9+\-\s]+$/),
  email: z.string().email().optional().or(z.literal('')),
  password: z.string().min(6).max(100),
  address: z.string().optional(),
  categoryId: z.string().min(1, 'Please select a service category'),
  yearsOfExperience: z.number().min(0).max(50),
  cooperativeId: z.string().optional(),
  preferredLanguage: z.enum(['en', 'hi']).default('en'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = workerRegisterSchema.parse(body);

    // Check if mobile already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { mobile: validated.mobile },
          ...(validated.email ? [{ email: validated.email }] : []),
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'A user with this mobile number or email already exists' },
        { status: 409 }
      );
    }

    // Validate category exists
    const category = await db.serviceCategory.findUnique({ where: { id: validated.categoryId } });
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Invalid service category' },
        { status: 400 }
      );
    }

    // Validate cooperative if provided
    if (validated.cooperativeId) {
      const cooperative = await db.cooperative.findUnique({ where: { id: validated.cooperativeId } });
      if (!cooperative) {
        return NextResponse.json(
          { success: false, error: 'Invalid cooperative' },
          { status: 400 }
        );
      }
    }

    const passwordHash = await bcrypt.hash(validated.password, 12);

    const user = await db.user.create({
      data: {
        name: validated.name,
        mobile: validated.mobile,
        email: validated.email || null,
        passwordHash,
        role: 'WORKER',
        preferredLanguage: validated.preferredLanguage,
        workerProfile: {
          create: {
            categoryId: validated.categoryId,
            yearsOfExperience: validated.yearsOfExperience,
            cooperativeId: validated.cooperativeId || null,
            verificationStatus: 'PENDING',
            availabilityStatus: 'OFFLINE',
          },
        },
      },
      select: {
        id: true,
        name: true,
        mobile: true,
        email: true,
        role: true,
        preferredLanguage: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error('Worker registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
