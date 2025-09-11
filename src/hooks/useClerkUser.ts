import { useAuth } from "@clerk/clerk-expo";
import { useEffect } from "react";
import { useUser } from "../contexts/UserContext";

export const useClerkUser = () => {
  const { userId, isLoaded } = useAuth();
  const { user, fetchUser, loading, error } = useUser();

  useEffect(() => {
    if (isLoaded && userId && !user) {
      fetchUser(userId);
    }
  }, [isLoaded, userId, user, fetchUser]);

  return {
    clerkUserId: userId,
    user,
    loading: loading || !isLoaded,
    error,
    isAuthenticated: !!userId,
  };
};
