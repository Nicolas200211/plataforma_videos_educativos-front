import { api } from '../lib/axios';
import type { Video } from '../types';

export const videosService = {
  async getAll(): Promise<Video[]> {
    const { data } = await api.get<Video[]>('/videos');
    return data;
  },

  async getCatalog(): Promise<Video[]> {
    const { data } = await api.get<Video[]>('/videos/catalog');
    return data;
  },

  async getAllAdmin(): Promise<Video[]> {
    const { data } = await api.get<Video[]>('/videos/admin/all');
    return data;
  },

  async getById(id: string): Promise<Video> {
    const { data } = await api.get<Video>(`/videos/${id}`);
    return data;
  },

  async getByCategory(categoryId: string): Promise<Video[]> {
    const { data } = await api.get<Video[]>(`/videos/category/${categoryId}`);
    return data;
  },

  async create(formData: FormData): Promise<Video> {
    const { data } = await api.post<Video>('/videos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  async update(id: string, formData: FormData): Promise<Video> {
    const { data } = await api.patch<Video>(`/videos/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/videos/${id}`);
  },

  async getVideoUrl(videoId: string): Promise<{ url: string }> {
    const { data } = await api.get(`/videos/${videoId}/watch`);
    return data;
  },
};
