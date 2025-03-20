// src/context/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if user is logged in on mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        
        if (token) {
          const user = await authAPI.getCurrentUser();
          setCurrentUser(user);
        }
      } catch (error) {
        console.error("Authentication error:", error);
        // If token is invalid, clear it
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };
    
    checkLoggedIn();
  }, []);
  
  // Sign up
  const signUp = async (email, password, name) => {
    setError(null);
    try {
      const response = await authAPI.register({
        email,
        password,
        confirm_password: password,
        name
      });
      
      // If registration is successful, login the user
      if (response.user) {
        // Store tokens
        localStorage.setItem('accessToken', response.access);
        localStorage.setItem('refreshToken', response.refresh);
        
        // Set current user
        setCurrentUser(response.user);
      }
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };
  
  // Sign in
  const signIn = async (email, password) => {
    setError(null);
    try {
      const response = await authAPI.login(email, password);
      
      // Get user data
      const userData = await authAPI.getCurrentUser();
      setCurrentUser(userData);
      
      return userData;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };
  
  // Sign out
  const signOut = () => {
    authAPI.logout();
    setCurrentUser(null);
  };
  
  // Reset password
  const resetPassword = async (email) => {
    setError(null);
    try {
      return await authAPI.requestPasswordReset(email);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };
  
  // Confirm password reset
  const confirmPasswordReset = async (uid, token, newPassword) => {
    setError(null);
    try {
      return await authAPI.confirmPasswordReset(uid, token, newPassword);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };
  
  // Update user profile
  const updateProfile = async (userData) => {
    // Implementation will be added later when we create the profile endpoint
  };
  
  const value = {
    currentUser,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    confirmPasswordReset,
    updateProfile
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};