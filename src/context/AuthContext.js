// src/context/AuthContext.js

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuthentication = async () => {
      setLoading(true);
      try {
        // Check if we have a token
        const token = localStorage.getItem('accessToken');
        
        if (token) {
          // Get user data
          const userData = await authAPI.getCurrentUser();
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        // If token is invalid or expired, clear it
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthentication();
  }, []);
  
  // Sign up new user
  const signUp = useCallback(async (email, password, name) => {
    setError(null);
    try {
      const response = await authAPI.register(email, password, name);
      
      // Store tokens from registration response
      if (response.access) {
        localStorage.setItem('accessToken', response.access);
      }
      if (response.refresh) {
        localStorage.setItem('refreshToken', response.refresh);
      }
      
      // Set current user from the response
      if (response.user) {
        setCurrentUser(response.user);
      }
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);
  
  // Sign in existing user
  const signIn = useCallback(async (email, password) => {
    setError(null);
    try {
      // Get tokens
      await authAPI.login(email, password);
      
      // Fetch user data
      const userData = await authAPI.getCurrentUser();
      setCurrentUser(userData);
      
      return userData;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);
  
  // Sign out current user
  const signOut = useCallback(() => {
    authAPI.logout();
    setCurrentUser(null);
  }, []);
  
  // Request password reset
  const resetPassword = useCallback(async (email) => {
    setError(null);
    try {
      return await authAPI.requestPasswordReset(email);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);
  
  // Confirm password reset
  const confirmPasswordReset = useCallback(async (uid, token, newPassword) => {
    setError(null);
    try {
      return await authAPI.confirmPasswordReset(uid, token, newPassword);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);
  
  // Update user profile (if needed)
  const updateProfile = useCallback(async (userData) => {
    setError(null);
    // This will be implemented when we add a profile update endpoint
  }, []);
  
  // Context value
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