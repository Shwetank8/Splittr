import { useUser, useAuth } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export function useStoreUser() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [userId, setUserId] = useState(null);
  const storeUser = useMutation(api.users.store);

  useEffect(() => {
    if (!isAuthenticated) return;

    const createUser = async () => {
      try {
        const token = await getToken({ template: "convex" });
        if (!token) throw new Error("No Clerk token found");

        const id = await storeUser({}, { authorization: `Bearer ${token}` });
        setUserId(id);
      } catch (err) {
        console.error("Error storing user:", err);
      }
    };

    createUser();
    return () => setUserId(null);
  }, [isAuthenticated, storeUser, user?.id, getToken]);

  return {
    isLoading: isLoading || (isAuthenticated && userId === null),
    isAuthenticated: isAuthenticated && userId !== null,
  };
}
