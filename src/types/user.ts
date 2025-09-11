export interface User {
  id: string;
  clerkId?: string;
  email: string;
  name?: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  fetchUser: (clerkId: string) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
}
