import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { z } from 'zod';

const customerRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  mobile: z.string().min(10).max(15).regex(/^[0-9+\-\s]+$/),
  email: z.string().email().optional().or(z.literal('')),
  password: z.string().min(6).max(100),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional().refine((val) => !val || /^[0-9]{6}$/.test(val), 'Pincode must be 6 digits'),
  preferredLanguage: z.enum(['en', 'hi']).default('en'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = customerRegisterSchema.parse(body);

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

    const passwordHash = await bcrypt.hash(validated.password, 12);

    const user = await db.user.create({
      data: {
        name: validated.name,
        mobile: validated.mobile,
        email: validated.email || null,
        passwordHash,
        role: 'CUSTOMER',
        preferredLanguage: validated.preferredLanguage,
        customerProfile: {
          create: {
            address: validated.address,
            city: validated.city,
            state: validated.state,
            pincode: validated.pincode,
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
    console.error('Customer registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
