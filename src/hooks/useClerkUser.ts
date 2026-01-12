import { useAuth } from "@clerk/clerk-expo";
import { useEffect, useRef } from "react";
import { useUser } from "../contexts/UserContext";

export const useClerkUser = () => {
  const { userId, isLoaded, signOut } = useAuth();
  const { user, fetchUser, loading, error } = useUser();
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (isLoaded && userId && !user && !hasFetchedRef.current) {
      console.log("Fetching user for clerkId:", userId);
      hasFetchedRef.current = true;
      fetchUser(userId);
    }

    // Reset quando userId mudar
    if (userId && hasFetchedRef.current) {
      hasFetchedRef.current = false;
    }
  }, [isLoaded, userId, user]);

  return {
    clerkUserId: userId,
    user,
    loading: loading || !isLoaded,
    error,
    signOut,
    isAuthenticated: !!userId,
  };
};
