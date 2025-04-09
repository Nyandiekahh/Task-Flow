import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const PendingInvitations = ({ onInvitationAccepted, lastRefresh }) => {
  const { token } = useContext(AuthContext);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resendLoading, setResendLoading] = useState({});
  const [deleteLoading, setDeleteLoading] = useState({});
  const [actionFeedback, setActionFeedback] = useState(null);

  // Convert to useCallback for dependency tracking
  const fetchPendingInvitations = useCallback(async () => {
    try {
      setLoading(true);
      
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const response = await axios.get(
        `${API_URL}/auth/invitations/`,
        { headers }
      );
      
      setPendingInvitations(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching invitations:", err);
      setError("Failed to load pending invitations. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Initial fetch and when token changes
  useEffect(() => {
    if (token) {
      fetchPendingInvitations();
    }
  }, [token, fetchPendingInvitations]);

  // Additional effect to refresh when lastRefresh signal changes
  useEffect(() => {
    if (token && lastRefresh) {
      fetchPendingInvitations();
    }
  }, [token, lastRefresh, fetchPendingInvitations]);

  // Instead of periodic checking, we'll implement a check on refresh button click
  // and when the component is focused or becomes visible
  
  // This function checks if any invitations have been accepted
  const checkInvitationStatus = useCallback(async () => {
    if (!token || pendingInvitations.length === 0) return;
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const currentResponse = await axios.get(
        `${API_URL}/auth/invitations/`,
        { headers }
      );
      
      // Check if any invitations are no longer in the list (accepted)
      const currentIds = new Set(currentResponse.data.map(inv => inv.id));
      const completedInvitations = pendingInvitations.filter(inv => !currentIds.has(inv.id));
      
      if (completedInvitations.length > 0) {
        // Update local state
        setPendingInvitations(currentResponse.data);
        
        // Notify parent component that invitations were accepted
        if (onInvitationAccepted) {
          onInvitationAccepted();
        }
      }
    } catch (error) {
      console.error("Error checking invitation status:", error);
    }
  }, [token, pendingInvitations, onInvitationAccepted]);
  
  // Check invitation status when the component mounts and when lastRefresh changes
  useEffect(() => {
    if (token) {
      checkInvitationStatus();
    }
  }, [token, lastRefresh, checkInvitationStatus]);

  const handleResendInvitation = async (invitationId) => {
    try {
      setResendLoading(prev => ({ ...prev, [invitationId]: true }));
      
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Add use_otp flag to request an OTP invitation
      await axios.post(
        `${API_URL}/auth/invitation/${invitationId}/resend/`,
        { use_otp: true },
        { headers }
      );
      
      setActionFeedback({
        type: 'success',
        message: 'Invitation resent successfully! A one-time password (OTP) has been sent to the user.'
      });
      
      // Refresh the list
      fetchPendingInvitations();
      
      // Clear feedback after 3 seconds
      setTimeout(() => {
        setActionFeedback(null);
      }, 3000);
    } catch (err) {
      console.error("Error resending invitation:", err);
      setActionFeedback({
        type: 'error',
        message: 'Failed to resend invitation.'
      });
    } finally {
      setResendLoading(prev => ({ ...prev, [invitationId]: false }));
    }
  };

  const handleDeleteInvitation = async (invitationId) => {
    // Confirm before deleting
    if (!window.confirm('Are you sure you want to delete this invitation?')) {
      return;
    }
    
    try {
      setDeleteLoading(prev => ({ ...prev, [invitationId]: true }));
      
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      await axios.delete(
        `${API_URL}/auth/invitation/${invitationId}/delete/`,
        { headers }
      );
      
      setActionFeedback({
        type: 'success',
        message: 'Invitation deleted successfully!'
      });
      
      // Refresh the list
      fetchPendingInvitations();
      
      // Clear feedback after 3 seconds
      setTimeout(() => {
        setActionFeedback(null);
      }, 3000);
    } catch (err) {
      console.error("Error deleting invitation:", err);
      setActionFeedback({
        type: 'error',
        message: 'Failed to delete invitation.'
      });
    } finally {
      setDeleteLoading(prev => ({ ...prev, [invitationId]: false }));
    }
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-5">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Action feedback message */}
      {actionFeedback && (
        <div className={`mx-6 mt-4 p-4 rounded-md ${
          actionFeedback.type === 'success' ? 'bg-green-50 border-green-400 text-green-700' : 
          'bg-red-50 border-red-400 text-red-700'
        } border-l-4`}>
          {actionFeedback.message}
        </div>
      )}
      
      {/* Invitations list */}
      {pendingInvitations.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invitee
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sent Date
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingInvitations.map((invitation) => (
                <tr key={invitation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {invitation.name ? invitation.name.substring(0, 2).toUpperCase() : 
                           invitation.email.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {invitation.name || "No name provided"}
                        </div>
                        <div className="text-sm text-gray-500">{invitation.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invitation.role_name || "Default role"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      invitation.email_sent ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {invitation.email_sent ? 'Sent' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(invitation.date_sent)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleResendInvitation(invitation.id)}
                      disabled={resendLoading[invitation.id]}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      {resendLoading[invitation.id] ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Resending...
                        </span>
                      ) : 'Resend invitation'}
                    </button>
                    <button
                      onClick={() => handleDeleteInvitation(invitation.id)}
                      disabled={deleteLoading[invitation.id]}
                      className="text-red-600 hover:text-red-900"
                    >
                      {deleteLoading[invitation.id] ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Deleting...
                        </span>
                      ) : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No pending invitations</h3>
          <p className="mt-1 text-sm text-gray-500">
            You haven't sent any invitations yet or all invitations have been accepted.
          </p>
          <div className="mt-6">
            <button
              onClick={() => fetchPendingInvitations()}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingInvitations;