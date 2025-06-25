import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/recipe';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  toggleFavorite: (recipeId: number) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('recipeBookUser');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('recipeBookUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (email && password) {
        const user: User = {
          id: `user_${Date.now()}`,
          name: email.split('@')[0],
          email,
          favorites: [],
        };
        
        setCurrentUser(user);
        localStorage.setItem('recipeBookUser', JSON.stringify(user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('recipeBookUser');
  };

  const toggleFavorite = (recipeId: number) => {
    if (!currentUser) return;

    const updatedUser = { ...currentUser };
    const favoriteIndex = updatedUser.favorites.indexOf(recipeId);

    if (favoriteIndex === -1) {
      updatedUser.favorites.push(recipeId);
    } else {
      updatedUser.favorites.splice(favoriteIndex, 1);
    }

    setCurrentUser(updatedUser);
    localStorage.setItem('recipeBookUser', JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    currentUser,
    login,
    logout,
    toggleFavorite,
    isAuthenticated: !!currentUser,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};