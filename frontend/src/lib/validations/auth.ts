import { z } from 'zod';

export const loginSchema = z.object({
  mobile: z
    .string()
    .min(10, 'Mobile number must be at least 10 digits')
    .max(15, 'Mobile number is too long')
    .regex(/^[0-9+\-\s]+$/, 'Invalid mobile number format'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
  role: z.enum(['CUSTOMER', 'WORKER', 'ADMIN'], {
    required_error: 'Please select a role',
  }),
});

export const customerRegisterSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  mobile: z
    .string()
    .min(10, 'Mobile number must be at least 10 digits')
    .max(15, 'Mobile number is too long')
    .regex(/^[0-9+\-\s]+$/, 'Invalid mobile number format'),
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long'),
  confirmPassword: z.string(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z
    .string()
    .optional()
    .refine((val) => !val || /^[0-9]{6}$/.test(val), 'Pincode must be 6 digits'),
  preferredLanguage: z.enum(['en', 'hi']).default('en'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const workerRegisterSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  mobile: z
    .string()
    .min(10, 'Mobile number must be at least 10 digits')
    .max(15, 'Mobile number is too long')
    .regex(/^[0-9+\-\s]+$/, 'Invalid mobile number format'),
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long'),
  confirmPassword: z.string(),
  address: z.string().optional(),
  categoryId: z.string().min(1, 'Please select a service category'),
  yearsOfExperience: z
    .number()
    .min(0, 'Experience cannot be negative')
    .max(50, 'Please enter valid experience'),
  cooperativeId: z.string().optional(),
  preferredLanguage: z.enum(['en', 'hi']).default('en'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CustomerRegisterInput = z.infer<typeof customerRegisterSchema>;
export type WorkerRegisterInput = z.infer<typeof workerRegisterSchema>;
