import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const TeamInvite = () => {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // Team members form state
  const [invites, setInvites] = useState([
    { email: '', role: 'admin', name: '' }
  ]);
  
  // State for titles from the system
  const [titles, setTitles] = useState([]);
  const [titlesLoading, setTitlesLoading] = useState(true);
  const [titlesError, setTitlesError] = useState(null);
  
  // Fetch titles when component mounts
  useEffect(() => {
    const fetchTitles = async () => {
      try {
        setTitlesLoading(true);
        setTitlesError(null);
        
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        
        // Get titles
        const response = await axios.get(`${API_URL}/titles/`, { headers });
        setTitles(response.data);
        
        // Update default role selection in forms
        if (response.data.length > 0) {
          const updatedInvites = invites.map(invite => ({
            ...invite,
            role: response.data[0].id // Set the first title as default
          }));
          setInvites(updatedInvites);
        }
        
      } catch (err) {
        console.error("Error fetching titles:", err);
        if (err.response?.status === 404) {
          // This might indicate titles haven't been set up yet
          setTitlesError("Titles haven't been set up yet. Users will be invited as Admins.");
        } else {
          setTitlesError("Failed to load titles. Users will be invited as Admins.");
        }
      } finally {
        setTitlesLoading(false);
      }
    };
    
    if (token) {
      fetchTitles();
    }
  }, [token, invites]);

  // Add another invite field
  const addInviteField = () => {
    // Use the first title ID if available, otherwise use 'admin'
    const defaultRole = titles.length > 0 ? titles[0].id : 'admin';
    setInvites([...invites, { email: '', role: defaultRole, name: '' }]);
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

  // Navigate to titles setup
  const navigateToTitlesSetup = () => {
    navigate('/onboarding/roles');
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
      setInvites([{ email: '', role: titles.length > 0 ? titles[0].id : 'admin', name: '' }]);
      
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

  // Get role options for select
  const getRoleOptions = () => {
    // If we have loaded titles, use those
    if (titles && titles.length > 0) {
      return titles.map(title => (
        <option key={title.id} value={title.id}>
          {title.name}
        </option>
      ));
    }
    
    // Otherwise, just use Admin as default
    return [
      <option key="admin" value="admin">Admin</option>
    ];
  };

  // Basic styling classes for use throughout the component
  const baseStyles = {
    container: "w-full max-w-4xl mx-auto py-6",
    header: "text-2xl font-bold text-gray-900 mb-4",
    subtext: "text-sm text-gray-500 mb-6",
    card: "bg-white shadow-lg rounded-lg overflow-hidden mb-6",
    cardHeader: "bg-gray-50 px-6 py-4 border-b border-gray-200",
    cardBody: "px-6 py-4",
    cardFooter: "bg-gray-50 px-6 py-3 flex justify-end border-t border-gray-200",
    input: "w-full p-2 border border-gray-300 rounded-md",
    select: "w-full p-2 border border-gray-300 rounded-md",
    primaryButton: "bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded",
    secondaryButton: "bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded mr-2",
    dangerButton: "text-red-600 hover:text-red-800",
    alertSuccess: "bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4",
    alertError: "bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4",
    alertWarning: "bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4",
  };

  return (
    <div className={baseStyles.container}>
      <h1 className={baseStyles.header}>Invite Team Members</h1>
      <p className={baseStyles.subtext}>
        Invite colleagues to join your organization with their appropriate roles.
      </p>
      
      {error && (
        <div className={baseStyles.alertError}>
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className={baseStyles.alertSuccess}>
          <p>Invitations sent successfully!</p>
        </div>
      )}
      
      {/* Titles Setup Notice */}
      {titlesError && (
        <div className={baseStyles.alertWarning}>
          <p>
            You haven't set up organization titles and roles yet. 
            New team members will be invited as Admins by default.
          </p>
          <div className="mt-2">
            <button 
              onClick={navigateToTitlesSetup}
              className="underline text-yellow-700 hover:text-yellow-800 mr-4"
            >
              Set up titles and roles now
            </button>
            <span>or</span>
            <Link
              to="/dashboard/team"
              className="underline text-yellow-700 hover:text-yellow-800 ml-4"
            >
              Continue without setting up titles
            </Link>
          </div>
        </div>
      )}
      
      {/* Title Management Section - Only show if titles are available */}
      {titles.length > 0 && (
        <div className={baseStyles.card}>
          <div className={baseStyles.cardHeader}>
            <h3 className="text-lg font-medium">Available Team Titles</h3>
          </div>
          <div className={baseStyles.cardBody}>
            <p className="mb-4">
              These are the current titles in your organization. Team members will be assigned one of these titles.
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {titles.map((title) => (
                <div 
                  key={title.id} 
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
                >
                  <span>{title.name}</span>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={navigateToTitlesSetup}
                className="text-blue-600 hover:text-blue-800"
              >
                Manage Titles and Permissions
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className={baseStyles.card}>
        <div className={baseStyles.cardHeader}>
          <h3 className="text-lg font-medium">Invite Team Members</h3>
          <p className="text-sm text-gray-500 mt-1">
            They will receive an email with instructions to set up their account.
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={baseStyles.cardBody}>
            {invites.map((invite, index) => (
              <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Team Member {index + 1}</h4>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeInviteField(index)}
                      className={baseStyles.dangerButton}
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {/* Name Field */}
                  <div>
                    <label htmlFor={`name-${index}`} className="block text-sm font-medium mb-1">Name (Optional)</label>
                    <input
                      type="text"
                      name="name"
                      id={`name-${index}`}
                      value={invite.name}
                      onChange={(e) => handleInputChange(index, e)}
                      className={baseStyles.input}
                    />
                  </div>
                  
                  {/* Email Field */}
                  <div>
                    <label htmlFor={`email-${index}`} className="block text-sm font-medium mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      id={`email-${index}`}
                      required
                      value={invite.email}
                      onChange={(e) => handleInputChange(index, e)}
                      className={baseStyles.input}
                    />
                  </div>
                  
                  {/* Role Field */}
                  <div>
                    <label htmlFor={`role-${index}`} className="block text-sm font-medium mb-1">
                      {titles && titles.length > 0 ? 'Title' : 'Role'}
                    </label>
                    <select
                      id={`role-${index}`}
                      name="role"
                      value={invite.role}
                      onChange={(e) => handleInputChange(index, e)}
                      className={baseStyles.select}
                    >
                      {titlesLoading ? (
                        <option value="">Loading...</option>
                      ) : (
                        getRoleOptions()
                      )}
                    </select>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="mt-4">
              <button
                type="button"
                onClick={addInviteField}
                className={baseStyles.secondaryButton}
              >
                + Add Another Member
              </button>
            </div>
          </div>
          
          <div className={baseStyles.cardFooter}>
            <button
              type="button"
              onClick={() => navigate('/dashboard/team')}
              className={baseStyles.secondaryButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={baseStyles.primaryButton}
            >
              {loading ? 'Sending...' : 'Send Invitations'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamInvite;