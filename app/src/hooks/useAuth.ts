import { signOut } from "@/data/auth";
import React, { createContext, useContext } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

type AuthContextType = {
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully.");
      navigate("/sign-in");
    } catch {
      toast.error("Failed to sign out. Please try again.");
    }
  };

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        signOut: handleSignOut,
      },
    },
    children
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider");
  }

  return context;
}
