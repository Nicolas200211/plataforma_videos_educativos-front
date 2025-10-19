export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'student';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMonths: number;
  isActive: boolean;
  features: string[];
  videos?: Array<{ id: string; title: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  subscriptionPlanId?: string;
  status: 'active' | 'inactive' | 'expired' | 'pending_payment';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  amountPaid: number;
  paymentMethod?: string;
  transactionId?: string;
  enrolledAt: string;
  expiresAt?: string;
  paymentVoucherUrl?: string;
  user?: User;
  subscriptionPlan?: SubscriptionPlan;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl?: string; // Opcional - no estará presente en videos bloqueados
  thumbnailUrl?: string;
  duration: number;
  isPublished?: boolean;
  viewCount: number;
  categoryId?: string;
  category?: Category;
  subscriptionPlans?: SubscriptionPlan[];
  createdAt?: string;
  updatedAt?: string;
  // Campos de control de acceso
  hasAccess?: boolean;
  isLocked?: boolean;
  requiredPlans?: Array<{ id: string; name: string }>;
}

export interface VideoWithAccess extends Video {
  hasAccess: boolean;
  accessToken?: string;
}
