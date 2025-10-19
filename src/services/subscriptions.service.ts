import { api } from '../lib/axios';
import type { SubscriptionPlan, Enrollment } from '../types';

export const subscriptionsService = {
  async getAllPlans(): Promise<SubscriptionPlan[]> {
    const { data } = await api.get<SubscriptionPlan[]>('/subscription-plans');
    return data;
  },

  async getActivePlans(): Promise<SubscriptionPlan[]> {
    const { data } = await api.get<SubscriptionPlan[]>('/subscription-plans/active');
    return data;
  },

  async getPlanById(id: string): Promise<SubscriptionPlan> {
    const { data } = await api.get<SubscriptionPlan>(`/subscription-plans/${id}`);
    return data;
  },

  async createPlan(plan: Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<SubscriptionPlan> {
    const { data } = await api.post<SubscriptionPlan>('/subscription-plans', plan);
    return data;
  },

  async updatePlan(id: string, plan: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    const { data } = await api.patch<SubscriptionPlan>(`/subscription-plans/${id}`, plan);
    return data;
  },

  async deletePlan(id: string): Promise<void> {
    await api.delete(`/subscription-plans/${id}`);
  },

  async togglePlanActive(id: string): Promise<SubscriptionPlan> {
    const { data } = await api.patch<SubscriptionPlan>(`/subscription-plans/${id}/toggle-active`);
    return data;
  },

  async createEnrollment(userId: string, planId: string, voucherFile?: File): Promise<Enrollment> {
    const formData = new FormData();
    formData.append('subscriptionPlanId', planId);

    if (voucherFile) {
      formData.append('paymentVoucher', voucherFile);
    }

    const { data } = await api.post<Enrollment>('/enrollments/request-subscription', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  async getAllEnrollments(): Promise<Enrollment[]> {
    const { data } = await api.get<Enrollment[]>('/enrollments');
    return data;
  },

  async approveEnrollment(enrollmentId: string): Promise<Enrollment> {
    const { data } = await api.patch<Enrollment>(`/enrollments/${enrollmentId}/approve`);
    return data;
  },

  async rejectEnrollment(enrollmentId: string): Promise<Enrollment> {
    const { data } = await api.patch<Enrollment>(`/enrollments/${enrollmentId}/reject`);
    return data;
  },

  async getMyEnrollment(): Promise<Enrollment | null> {
    try {
      const { data } = await api.get<Enrollment>('/enrollments/my-enrollment');
      return data;
    } catch (error) {
      return null;
    }
  },

  async checkAccess(): Promise<boolean> {
    try {
      const { data } = await api.get<{ hasAccess: boolean }>('/enrollments/check-access');
      return data.hasAccess;
    } catch (error) {
      return false;
    }
  },
};
