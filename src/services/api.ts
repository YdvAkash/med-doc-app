import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your local IP address for physical device testing, e.g., 'http://192.168.1.100:8080/api'
const API_URL = 'http://192.168.29.251:8080/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the error response is 401 (Unauthorized), we could dispatch a logout event
    // For now, we simply pass it through for the UI / store to handle.
    return Promise.reject(error);
  }
);

export const uploadDocument = async (fileUri: string, mimeType: string, fileName: string, onUploadProgress?: (progressEvent: any) => void) => {
  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    type: mimeType,
    name: fileName,
  } as any);

  const response = await api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
  return response.data;
};

export const getDocuments = async (page = 0, size = 20, search?: string, category?: string) => {
  let url = `/documents?page=${page}&size=${size}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (category && category !== 'All') url += `&category=${encodeURIComponent(category)}`;
  const response = await api.get(url);
  return response.data;
};

export const getDocument = async (id: number) => {
  const response = await api.get(`/documents/${id}`);
  return response.data;
};

export const generateDocumentSummary = async (id: number) => {
  const response = await api.post(`/documents/${id}/summary`);
  return response.data;
};

export const translateDocument = async (id: number, language: string) => {
  const response = await api.post(`/documents/${id}/translate?lang=${language}`);
  return response.data;
};

export const deleteDocument = async (id: number) => {
  const response = await api.delete(`/documents/${id}`);
  return response.data;
};

export const getDocumentText = async (id: number) => {
  const response = await api.get(`/documents/${id}/text`);
  return response.data;
};

export const confirmDate = async (id: number, date: string) => {
  const response = await api.post(`/documents/${id}/confirm-date`, { extractedEventDate: date });
  return response.data;
};

export const getTimeline = async () => {
  const response = await api.get('/timeline');
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

export const updateProfile = async (data: any) => {
  const response = await api.put('/auth/profile', data);
  return response.data;
};

export const loginUser = async (data: any) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const registerUser = async (data: any) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const verifyRegistration = async (email: string, otp: string) => {
  const response = await api.post('/auth/verify-registration', { email, otp });
  return response.data;
};

export const forgotPassword = async (email: string) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (email: string, otp: string, newPassword: string) => {
  const response = await api.post('/auth/reset-password', { email, otp, newPassword });
  return response.data;
};

export const uploadProfilePicture = async (fileUri: string, mimeType: string, fileName: string) => {
  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    type: mimeType,
    name: fileName,
  } as any);

  const response = await api.post('/auth/profile/picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const askQuestion = async (message: string) => {
  const response = await api.post('/chat/ask', { message });
  return response.data;
};

export const createOrder = async (plan: string) => {
  const response = await api.post('/subscription/create-order', { plan });
  return response.data;
};

export const verifyPayment = async (razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string, plan: string) => {
  const response = await api.post('/subscription/verify-payment', { razorpayOrderId, razorpayPaymentId, razorpaySignature, plan });
  return response.data;
};

export const getChatHistory = async (page = 0, size = 20) => {
  const response = await api.get(`/chat/history?page=${page}&size=${size}`);
  return response.data;
};

export const updatePushToken = async (token: string) => {
  const response = await api.put('/auth/profile/push-token', { token });
  return response.data;
};
