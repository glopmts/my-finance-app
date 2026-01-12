import React, { createContext, ReactNode, useContext, useState } from "react";
import { userService } from "../services/user.service";
import { User, UserContextType } from "../types/user";

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async (clerkId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const userData = await userService.getUserByClerkId(clerkId);

      setUser(userData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao buscar usuário";
      console.error("Error fetching user:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updates: Partial<User>): Promise<void> => {
    try {
      if (!user) throw new Error("Nenhum usuário carregado");

      setLoading(true);
      setError(null);

      const updatedUser = await userService.updateUser(user.id!, updates);
      setUser(updatedUser);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao atualizar usuário"
      );
      console.error("Error updating user:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  const value: UserContextType = {
    user,
    loading,
    error,
    fetchUser,
    updateUser,
    clearError,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
