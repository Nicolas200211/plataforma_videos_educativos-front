import { api } from '../lib/axios';
import type { User } from '../types';

export const usersService = {
  async getAll(): Promise<User[]> {
    const { data } = await api.get<User[]>('/users');
    return data;
  },

  async getById(id: string): Promise<User> {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },

  async update(id: string, user: Partial<User>): Promise<User> {
    const { data } = await api.patch<User>(`/users/${id}`, user);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};
