// src/context/AuthContext.js

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuthentication = async () => {
      setLoading(true);
      try {
        // Check if we have a token
        const storedToken = localStorage.getItem('token');
        
        if (storedToken) {
          // Set token in state
          setToken(storedToken);
          
          // Get user data
          const userData = await authAPI.getCurrentUser();
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        // If token is invalid or expired, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setToken(null);
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
      console.log('Sending registration data:', { email, password, name });
      
      // Create userData object with the correct field names
      const userData = {
        email: email,
        name: name,
        password: password,
        confirm_password: password
      };
      
      console.log('Registration payload:', userData);
      
      // Call register with the userData object
      const response = await authAPI.register(userData);
      
      // Store tokens from registration response
      if (response.access) {
        localStorage.setItem('token', response.access);
        setToken(response.access);
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
      console.error('Full signup error:', error);
      setError(error.message || 'An error occurred during signup');
      throw error;
    }
  }, []);
  
  // Sign in existing user
  const signIn = useCallback(async (email, password) => {
    setError(null);
    try {
      // Get tokens
      const response = await authAPI.login(email, password);
      
      // Store tokens properly
      if (response.access) {
        localStorage.setItem('token', response.access);
        setToken(response.access);
      }
      if (response.refresh) {
        localStorage.setItem('refreshToken', response.refresh);
      }
      
      // Fetch user data
      const userData = await authAPI.getCurrentUser();
      setCurrentUser(userData);
      
      return userData;
    } catch (error) {
      setError(error.message || 'An error occurred during sign in');
      throw error;
    }
  }, []);
  
  // Sign out current user
  const signOut = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setCurrentUser(null);
  }, []);
  
  // Refresh the access token using refresh token
  const refreshToken = useCallback(async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refreshToken');
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }
      
      const response = await authAPI.refreshToken(refreshTokenValue);
      
      if (response.access) {
        localStorage.setItem('token', response.access);
        setToken(response.access);
        return response.access;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      // If refresh fails, sign the user out
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setToken(null);
      setCurrentUser(null);
      throw error;
    }
  }, []);
  
  // Request password reset
  const resetPassword = useCallback(async (email) => {
    setError(null);
    try {
      // This will now send an OTP instead of a reset link
      return await authAPI.resetPassword(email);
    } catch (error) {
      setError(error.message || 'An error occurred during password reset');
      throw error;
    }
  }, []);
  
  // Confirm password reset
  const confirmPasswordReset = useCallback(async (email, otp, newPassword) => {
    setError(null);
    try {
      // This will now verify the OTP instead of using uid/token
      return await authAPI.confirmResetPassword(email, otp, newPassword);
    } catch (error) {
      setError(error.message || 'An error occurred during password reset confirmation');
      throw error;
    }
  }, []);
  
  // Update user profile
  const updateProfile = useCallback(async (userData) => {
    setError(null);
    try {
      // Implement when profile update endpoint is available
      // const response = await authAPI.updateProfile(userData);
      // setCurrentUser(prevUser => ({ ...prevUser, ...response }));
      // return response;
    } catch (error) {
      setError(error.message || 'An error occurred during profile update');
      throw error;
    }
  }, []);

  // Verify OTP for team member first login
  const verifyOtp = useCallback(async (email, otp) => {
    setError(null);
    try {
      const response = await authAPI.verifyOtp(email, otp);
      
      // Store temp token if provided
      if (response && response.temp_token) {
        localStorage.setItem('temp_token', response.temp_token);
      }
      
      return response;
    } catch (error) {
      setError(error.message || 'Invalid OTP. Please try again.');
      throw error;
    }
  }, []);
  
  // Set password with OTP for first-time login
  const setPasswordWithOtp = useCallback(async (email, newPassword, tempToken) => {
    setError(null);
    try {
      const response = await authAPI.setPasswordWithOtp(email, newPassword, tempToken);
      
      // Remove temp token if it exists
      localStorage.removeItem('temp_token');
      
      // Store permanent tokens
      if (response.access) {
        localStorage.setItem('token', response.access);
        setToken(response.access);
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
      setError(error.message || 'Failed to set password. Please try again.');
      throw error;
    }
  }, []);
  
  // Accept invitation and set password
  const acceptInvitation = useCallback(async (token, password) => {
    setError(null);
    try {
      const response = await authAPI.acceptInvitation(token, password);
      
      // Store tokens
      if (response.access) {
        localStorage.setItem('token', response.access);
        setToken(response.access);
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
      setError(error.message || 'Failed to accept invitation. Please try again.');
      throw error;
    }
  }, []);
  
  // Send invitation with OTP to team member
  const sendTeamInvite = useCallback(async (email, role, title) => {
    setError(null);
    try {
      const response = await authAPI.sendTeamInvite(email, role, title);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to send invitation. Please try again.');
      throw error;
    }
  }, []);
  
  // Context value
  const value = {
    currentUser,
    token,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    refreshToken,
    resetPassword,
    confirmPasswordReset,
    updateProfile,
    verifyOtp,
    setPasswordWithOtp,
    sendTeamInvite,
    acceptInvitation
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};