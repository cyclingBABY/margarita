import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from './types';

// We drop Firebase User dependency for email login
interface AuthContextType {
  user: any | null; 
  profile: UserProfile | null;
  loading: boolean;
  isAuthReady: boolean;
  setSession: (token: string, userData: any) => void;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAuthReady: false,
  setSession: () => {},
  clearSession: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const clearSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setProfile(null);
  };

  const setSession = (token: string, userData: any) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        clearSession();
      }
    }
    setIsAuthReady(true);
  }, []);

  useEffect(() => {
    if (user?.uid) {
      const fetchProfile = async () => {
        try {
          const response = await fetch(`http://localhost/margarita/api/profile.php?uid=${user.uid}`);
          if (response.ok) {
            const userProfile = await response.json();
            setProfile(userProfile);
            // Sync user changes locally
            const updatedUser = { ...user, ...userProfile };
            localStorage.setItem('user', JSON.stringify(updatedUser));
          } else if (response.status === 401) {
             // Only clear on 401 (unauthorized), not 404 during potential registration races
             clearSession();
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user?.uid]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAuthReady, setSession, clearSession }}>
      {children}
    </AuthContext.Provider>
  );
};
