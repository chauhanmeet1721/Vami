import { ApiClient, ApiResponse } from '@/core/api-client';
import { API_ENDPOINTS } from '@/core/constants';
import { User, UpdateUserPayload } from '../types';

export const usersApi = {
  getAll: async (): Promise<ApiResponse<User[]>> => {
    return ApiClient.get<User[]>(API_ENDPOINTS.USERS.BASE);
  },

  getById: async (id: string): Promise<ApiResponse<User>> => {
    return ApiClient.get<User>(API_ENDPOINTS.USERS.BY_ID(id));
  },

  update: async (id: string, payload: UpdateUserPayload): Promise<ApiResponse<User>> => {
    return ApiClient.patch<User>(API_ENDPOINTS.USERS.BY_ID(id), payload);
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    return ApiClient.delete<null>(API_ENDPOINTS.USERS.BY_ID(id));
  },
};
