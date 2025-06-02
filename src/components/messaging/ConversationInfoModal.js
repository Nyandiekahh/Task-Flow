// src/components/messaging/ConversationInfoModal.js
import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { addParticipant, removeParticipant } from '../../services/messagingService';

const ConversationInfoModal = ({ conversation, onClose }) => {
  const { currentUser } = useContext(AuthContext);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Early return for loading state
  if (!conversation || !conversation.participants || !currentUser) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <p>Loading conversation details...</p>
        </div>
      </div>
    );
  }

  // Check if current user is admin with proper null checks
  const isAdmin = conversation.participants.some(
    p => p?.user?.id === currentUser?.id && p?.is_admin
  );

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    if (!newParticipantEmail.trim()) return;

    try {
      setIsSubmitting(true);
      setError('');
      
      // In a real app, you'd need an endpoint to look up users by email
      // For now, we'll assume this is handled server-side when adding by email
      await addParticipant(conversation.id, newParticipantEmail);
      
      setNewParticipantEmail('');
      setShowAddParticipant(false);
      
      // Ideally you'd refresh the conversation data here
    } catch (error) {
      console.error('Error adding participant:', error);
      setError('Failed to add participant. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveParticipant = async (participantId) => {
    if (!window.confirm('Are you sure you want to remove this participant?')) {
      return;
    }

    try {
      await removeParticipant(conversation.id, participantId);
      // Ideally you'd refresh the conversation data here
    } catch (error) {
      console.error('Error removing participant:', error);
      alert('Failed to remove participant. Please try again.');
    }
  };

  const handleLeaveConversation = async () => {
    if (!window.confirm('Are you sure you want to leave this conversation?')) {
      return;
    }

    try {
      await removeParticipant(conversation.id, currentUser.id);
      onClose();
      // Redirect or refresh the conversation list
    } catch (error) {
      console.error('Error leaving conversation:', error);
      alert('Failed to leave conversation. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Conversation Info</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-grow">
          {conversation.is_group_chat && (
            <div className="mb-4">
              <h3 className="font-medium text-gray-900">Group Name</h3>
              <p className="mt-1">{conversation.name || 'Unnamed Group'}</p>
            </div>
          )}
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-gray-900">
                {conversation.is_group_chat ? 'Participants' : 'Participant'}
              </h3>
              {conversation.is_group_chat && isAdmin && (
                <button
                  onClick={() => setShowAddParticipant(!showAddParticipant)}
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
                  Add Participant
                </button>
              )}
            </div>
            
            {showAddParticipant && (
              <form onSubmit={handleAddParticipant} className="mb-3">
                <div className="flex">
                  <input
                    type="email"
                    value={newParticipantEmail}
                    onChange={(e) => setNewParticipantEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="flex-1 border rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                  <button
                    type="submit"
                    className={`px-4 py-2 bg-blue-500 text-white rounded-r-md ${
                      isSubmitting ? 'bg-blue-300 cursor-not-allowed' : 'hover:bg-blue-600'
                    }`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Adding...' : 'Add'}
                  </button>
                </div>
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </form>
            )}
            
            <ul className="divide-y">
              {conversation.participants.map((participant) => (
                <li key={participant?.id || Math.random()} className="py-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                      {participant?.user?.first_name ? participant.user.first_name[0].toUpperCase() : '?'}
                    </div>
                    <div>
                      <p className="font-medium">
                        {participant?.user?.id === currentUser?.id 
                          ? 'You' 
                          : participant?.user?.first_name && participant?.user?.last_name 
                            ? `${participant.user.first_name} ${participant.user.last_name}` 
                            : participant?.user?.email || 'Unknown User'}
                        {participant?.is_admin && ' (Admin)'}
                      </p>
                      <p className="text-sm text-gray-500">{participant?.user?.email || 'No email available'}</p>
                    </div>
                  </div>
                  
                  {/* Remove participant button (show only if admin and not for current user) */}
                  {isAdmin && participant?.user?.id !== currentUser?.id && (
                    <button
                      onClick={() => handleRemoveParticipant(participant?.user?.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Remove participant"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="p-4 border-t">
          <button
            onClick={handleLeaveConversation}
            className="w-full py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            {conversation.is_group_chat ? 'Leave Group' : 'Delete Conversation'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationInfoModal;