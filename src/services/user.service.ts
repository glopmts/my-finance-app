import { api } from "../lib/axios";
import { User } from "../types/user";

export const userService = {
  getUserByClerkId: async (userId: string): Promise<User> => {
    const response = await api.get(`/auth/${userId}`);
    return response.data;
  },

  createUser: async (userData: Omit<User, "id">): Promise<User> => {
    const response = await api.post("/auth/creater/", userData);
    return response.data;
  },

  updateUser: async (userId: string, updates: Partial<User>): Promise<User> => {
    const response = await api.patch(`/auth/update/${userId}`, updates);
    return response.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}`);
  },
};
