export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Mistrify';

export const SERVICE_CATEGORY_ICONS: Record<string, string> = {
  'Electrician': 'Zap',
  'Plumber': 'Droplets',
  'Carpenter': 'Hammer',
  'Painter': 'Paintbrush',
  'Domestic Helper': 'Home',
  'Caregiver': 'Heart',
  'Driver': 'Car',
  'Gardener': 'Flower2',
  'Cleaner': 'Sparkles',
  'Technician': 'Wrench',
};

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
] as const;

export const VERIFICATION_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pending Verification', color: 'yellow' },
  VERIFIED: { label: 'Verified', color: 'green' },
  REJECTED: { label: 'Rejected', color: 'red' },
};

export const AVAILABILITY_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ONLINE: { label: 'Online', color: 'green' },
  OFFLINE: { label: 'Offline', color: 'gray' },
  BUSY: { label: 'Busy', color: 'orange' },
};
