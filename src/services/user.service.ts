import { api } from "../lib/axios";
import { User } from "../types/user";

export const userService = {
  getUserByClerkId: async (clerkId: string): Promise<User> => {
    const response = await api.get(`/auth/user/${clerkId}`);
    return response.data;
  },

  createUser: async (userData: Omit<User, "id">): Promise<User> => {
    const response = await api.post("/users", userData);
    return response.data;
  },

  updateUser: async (userId: string, updates: Partial<User>): Promise<User> => {
    const response = await api.patch(`/users/${userId}`, updates);
    return response.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}`);
  },
};
