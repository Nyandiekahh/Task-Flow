import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem('taskflow_user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user:', e);
        localStorage.removeItem('taskflow_user');
      }
    }
    setLoading(false);
  }, []);

  // For a real app, you would connect to your backend here
  const signUp = async (email, password, name) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create user object (in a real app, this would come from your backend)
      const newUser = {
        id: `user_${Date.now()}`,
        email,
        name,
        role: 'admin',
        createdAt: new Date().toISOString(),
      };
      
      setCurrentUser(newUser);
      localStorage.setItem('taskflow_user', JSON.stringify(newUser));
      setLoading(false);
      return newUser;
    } catch (err) {
      setError(err.message || 'An error occurred during sign up');
      setLoading(false);
      throw err;
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful login (in a real app, validate credentials with your backend)
      const user = {
        id: `user_${Date.now()}`,
        email,
        name: 'Demo User',
        role: 'admin',
        createdAt: new Date().toISOString(),
      };
      
      setCurrentUser(user);
      localStorage.setItem('taskflow_user', JSON.stringify(user));
      setLoading(false);
      return user;
    } catch (err) {
      setError(err.message || 'An error occurred during sign in');
      setLoading(false);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      // In a real app, you would call your backend to invalidate the session
      setCurrentUser(null);
      localStorage.removeItem('taskflow_user');
    } catch (err) {
      setError(err.message || 'An error occurred during sign out');
      throw err;
    }
  };

  const resetPassword = async (email) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.message || 'An error occurred while resetting password');
      setLoading(false);
      throw err;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};