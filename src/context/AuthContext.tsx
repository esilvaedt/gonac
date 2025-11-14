"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem("auth_token");
    const email = localStorage.getItem("user_email");
    const name = localStorage.getItem("user_name");

    if (token && email) {
      setUser({ email, name: name || undefined });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Redirect logic
    const publicPaths = ["/login", "/signup"];
    const isPublicPath = publicPaths.includes(pathname);

    if (!loading) {
      if (!user && !isPublicPath) {
        // Not authenticated and trying to access protected route
        router.push("/login");
      } else if (user && isPublicPath) {
        // Authenticated and trying to access login/signup
        router.push("/");
      }
    }
  }, [user, loading, pathname, router]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const login = async (email: string, password: string) => {
    // TODO: Replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    localStorage.setItem("auth_token", "demo_token");
    localStorage.setItem("user_email", email);
    setUser({ email });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const signup = async (name: string, email: string, password: string) => {
    // TODO: Replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    localStorage.setItem("auth_token", "demo_token");
    localStorage.setItem("user_email", email);
    localStorage.setItem("user_name", name);
    setUser({ email, name });
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_name");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
