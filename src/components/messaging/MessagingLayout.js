// src/components/messaging/MessagingLayout.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ConversationList from './ConversationList';
import ConversationDetail from './ConversationDetail';
import NewConversationModal from './NewConversationModal';
import { getConversations } from '../../services/messagingService';

const MessagingLayout = () => {
  const { currentUser } = useContext(AuthContext);
  const { conversationId } = useParams();
  const navigate = useNavigate();
  
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(null);
  
  // Function declaration for dependency array
  const fetchConversations = async () => {
    try {
      setLoading(true);
      console.log("Fetching conversations...");
      const response = await getConversations();
      console.log("Conversations response:", response);
      setConversations(response.data);
      
      // If no conversation is selected and we have conversations, select the first one
      if (!conversationId && response.data.length > 0) {
        navigate(`/dashboard/messages/${response.data[0].id}`);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch conversations
  useEffect(() => {
    fetchConversations();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Effect to set default organization
  useEffect(() => {
    console.log("Current user object:", currentUser);
    if (currentUser && currentUser.organization) {
      // User has organization as a single ID, not an array
      console.log("Setting organization ID:", currentUser.organization);
      setSelectedOrganizationId(currentUser.organization);
    } else {
      console.log("No organization found in user object");
      // Fallback to hardcoded ID only if no organization exists
      const hardcodedOrgId = 1;
      console.log("Setting hardcoded organization ID:", hardcodedOrgId);
      setSelectedOrganizationId(hardcodedOrgId);
    }
  }, [currentUser]);
  
  const handleNewConversationSuccess = (newConversation) => {
    setConversations([newConversation, ...conversations]);
    navigate(`/dashboard/messages/${newConversation.id}`);
    setShowNewConversationModal(false);
  };
  
  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar with conversation list */}
      <div className="w-1/4 border-r h-full bg-gray-50 overflow-hidden flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Messages</h2>
          <button 
            className="mt-2 w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            onClick={() => setShowNewConversationModal(true)}
          >
            New Message
          </button>
        </div>
        
        <div className="flex-1 overflow-auto">
          <ConversationList 
            conversations={conversations} 
            selectedConversationId={conversationId} 
            loading={loading}
          />
        </div>
      </div>
      
      {/* Conversation detail */}
      <div className="flex-1 h-full overflow-hidden">
        {conversationId ? (
          <ConversationDetail 
            conversationId={conversationId} 
            onConversationUpdate={fetchConversations}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="text-lg">Select a conversation or start a new one</p>
              <button 
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                onClick={() => setShowNewConversationModal(true)}
              >
                New Message
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* New conversation modal */}
      {showNewConversationModal && (
        <NewConversationModal 
          onClose={() => setShowNewConversationModal(false)}
          onSuccess={handleNewConversationSuccess}
          organizationId={selectedOrganizationId}
        />
      )}
    </div>
  );
};

export default MessagingLayout;