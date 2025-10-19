import { api } from '../lib/axios';
import type { Category } from '../types';

export const categoriesService = {
  async getAll(): Promise<Category[]> {
    const { data } = await api.get<Category[]>('/categories');
    return data;
  },

  async getAllAdmin(): Promise<Category[]> {
    const { data } = await api.get<Category[]>('/categories/admin/all');
    return data;
  },

  async getById(id: string): Promise<Category> {
    const { data } = await api.get<Category>(`/categories/${id}`);
    return data;
  },

  async create(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    const { data } = await api.post<Category>('/categories', category);
    return data;
  },

  async update(id: string, category: Partial<Category>): Promise<Category> {
    const { data } = await api.patch<Category>(`/categories/${id}`, category);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};
