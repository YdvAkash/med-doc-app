import { api } from './api';

export const DocumentService = {
  upload: async (fileUri: string, fileName: string, mimeType: string): Promise<any> => {
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      name: fileName,
      type: mimeType,
    } as any);

    const response = await api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  list: async (page = 0, size = 20): Promise<any> => {
    const response = await api.get(`/documents?page=${page}&size=${size}`);
    return response.data;
  },

  getById: async (id: number): Promise<any> => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  delete: async (id: number): Promise<any> => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },
};
