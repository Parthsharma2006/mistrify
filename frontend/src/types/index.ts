export type UserRole = 'CUSTOMER' | 'WORKER' | 'ADMIN';

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type AvailabilityStatus = 'ONLINE' | 'OFFLINE' | 'BUSY';

export interface SessionUser {
  id: string;
  name: string;
  email?: string;
  mobile: string;
  role: UserRole;
  profilePhoto?: string;
  preferredLanguage: string;
}

export interface DashboardStats {
  totalWorkers: number;
  totalCustomers: number;
  totalCooperatives: number;
  pendingVerifications: number;
}

export interface ServiceCategoryWithSubs {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  isActive: boolean;
  subcategories: {
    id: string;
    name: string;
    description: string | null;
  }[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}
