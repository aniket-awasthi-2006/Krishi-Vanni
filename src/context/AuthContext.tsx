import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface FarmerUser {
  id: string;
  mobile: string;
  name: string;
  language: string;
  state?: string;
  district?: string;
  primaryCrop?: string;
}

interface AuthContextType {
  user: FarmerUser | null;
  isLoading: boolean;
  login: (mobile: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  sendOtp: (mobile: string, intent?: 'register' | 'login') => Promise<{ success: boolean; message?: string; error?: string; demoOtp?: string }>;
  verifyOtp: (mobile: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { mobile: string; otp: string; name: string; pin: string; language?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FarmerUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (mobile: string, pin: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, pin }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during login' };
    }
  };

  const sendOtp = async (mobile: string, intent: 'register' | 'login' = 'register') => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, intent }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to send OTP' };
      }

      return {
        success: true,
        message: data.message,
        demoOtp: data.demoOtp,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const verifyOtp = async (mobile: string, otp: string) => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid OTP code' };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Verification error' };
    }
  };

  const register = async (data: {
    mobile: string;
    otp: string;
    name: string;
    pin: string;
    language?: string;
  }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Registration failed' };
      }

      setUser(resData.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration error' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        sendOtp,
        verifyOtp,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
