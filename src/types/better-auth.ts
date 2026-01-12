export interface BetterAuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  data?: {
    user: BetterAuthUser;
    token?: string;
    redirect?: boolean;
    url?: string;
  };
  error?: {
    message: string;
    code?: string;
  };
}

export type AuthProvider = "google" | "github";
