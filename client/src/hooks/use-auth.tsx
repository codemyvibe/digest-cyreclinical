import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User as SelectUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  requestMagicLinkMutation: UseMutationResult<void, Error, RequestMagicLinkData>;
  verifyMagicLinkMutation: UseMutationResult<SelectUser, Error, VerifyMagicLinkData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<void, Error, RegisterData>;
  verifyEmailMutation: UseMutationResult<SelectUser, Error, VerifyEmailData>;
};

type RequestMagicLinkData = {
  email: string;
};

type VerifyMagicLinkData = {
  token: string;
};

type VerifyEmailData = {
  token: string;
};

type RegisterData = {
  name: string;
  email: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Request a magic link for login
  const requestMagicLinkMutation = useMutation({
    mutationFn: async (data: RequestMagicLinkData) => {
      await apiRequest("POST", "/api/auth/magic-link", data);
    },
    onSuccess: () => {
      toast({
        title: "Magic link sent",
        description: "Check your email for a login link",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send magic link",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  // Verify a magic link token and login
  const verifyMagicLinkMutation = useMutation({
    mutationFn: async (data: VerifyMagicLinkData) => {
      const res = await apiRequest("POST", "/api/auth/login", data);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/auth/user"], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid or expired login link",
        variant: "destructive",
      });
    },
  });

  // Register a new user
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      await apiRequest("POST", "/api/users/signup", userData);
    },
    onSuccess: () => {
      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      });
    },
  });

  // Verify email registration
  const verifyEmailMutation = useMutation({
    mutationFn: async (data: VerifyEmailData) => {
      const res = await apiRequest("POST", "/api/users/verify", data);
      return await res.json();
    },
    onSuccess: (data: { user?: SelectUser; message: string }) => {
      if (data.user) {
        queryClient.setQueryData(["/api/auth/user"], data.user);
      }
      toast({
        title: "Email verified",
        description: "Your account has been verified successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid or expired verification token",
        variant: "destructive",
      });
    },
  });

  // Logout user
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        requestMagicLinkMutation,
        verifyMagicLinkMutation,
        logoutMutation,
        registerMutation,
        verifyEmailMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}