import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TeamInvite = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // Team members form state
  const [invites, setInvites] = useState([
    { email: '', role: 'member', name: '' }
  ]);

  // Add another invite field
  const addInviteField = () => {
    setInvites([...invites, { email: '', role: 'member', name: '' }]);
  };

  // Remove an invite field
  const removeInviteField = (index) => {
    const updatedInvites = [...invites];
    updatedInvites.splice(index, 1);
    setInvites(updatedInvites);
  };

  // Handle input changes
  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    const updatedInvites = [...invites];
    updatedInvites[index] = {
      ...updatedInvites[index],
      [name]: value
    };
    setInvites(updatedInvites);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate emails
    const isValid = invites.every(invite => {
      if (!invite.email.trim()) return false;
      // Simple email validation regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(invite.email);
    });
    
    if (!isValid) {
      setError("Please enter valid email addresses for all team members.");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
      const token = localStorage.getItem('token');
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Filter out any empty invites
      const validInvites = invites.filter(invite => invite.email.trim() !== '');
      
      // Send invites to backend
      await axios.post(
        `${API_URL}/accounts/invite/`,
        { invitations: validInvites },
        { headers }
      );
      
      setSuccess(true);
      // Clear form after successful submission
      setInvites([{ email: '', role: 'member', name: '' }]);
      
      // Show success message for 3 seconds, then reset
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (err) {
      console.error("Error sending invites:", err);
      setError("Failed to send invites. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Invite Team Members</h1>
        
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
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
        )}
        
        {success && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">Invitations sent successfully!</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <form onSubmit={handleSubmit}>
            <div className="px-4 py-5 sm:p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Invite colleagues to join your organization. They will receive an email with instructions to set up their account.
                </p>
              </div>
              
              {invites.map((invite, index) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Team Member {index + 1}</h4>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeInviteField(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {/* Name Field */}
                    <div>
                      <label htmlFor={`name-${index}`} className="block text-sm font-medium text-gray-700">Name (Optional)</label>
                      <input
                        type="text"
                        name="name"
                        id={`name-${index}`}
                        value={invite.name}
                        onChange={(e) => handleInputChange(index, e)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    
                    {/* Email Field */}
                    <div>
                      <label htmlFor={`email-${index}`} className="block text-sm font-medium text-gray-700">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        id={`email-${index}`}
                        required
                        value={invite.email}
                        onChange={(e) => handleInputChange(index, e)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    
                    {/* Role Field */}
                    <div>
                      <label htmlFor={`role-${index}`} className="block text-sm font-medium text-gray-700">Role</label>
                      <select
                        id={`role-${index}`}
                        name="role"
                        value={invite.role}
                        onChange={(e) => handleInputChange(index, e)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="member">Member</option>
                        <option value="guest">Guest</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-4">
                <button
                  type="button"
                  onClick={addInviteField}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Another
                </button>
              </div>
            </div>
            
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                Send Invitations
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeamInvite;