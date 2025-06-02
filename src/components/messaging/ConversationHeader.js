// src/components/messaging/ConversationHeader.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import ConversationInfoModal from './ConversationInfoModal';

const ConversationHeader = ({ conversation, pinnedMessages, togglePinnedMessages }) => {
  const { currentUser } = useContext(AuthContext);
  const [showInfo, setShowInfo] = useState(false);
  
  // Early return for loading state if data isn't available
  if (!conversation || !conversation.participants || !currentUser) {
    return (
      <div className="border-b p-4 flex items-center justify-between bg-white">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
            ?
          </div>
          <div>
            <h2 className="font-medium">Loading...</h2>
          </div>
        </div>
      </div>
    );
  }
  
  // Get conversation name (either explicit name or other participant's name)
  const getConversationName = () => {
    if (conversation?.is_group_chat && conversation?.name) {
      return conversation.name;
    }
    
    // For direct messages, show the other person's name
    const otherParticipant = conversation?.participants?.find(
      p => p?.user?.id !== currentUser?.id
    );
    
    if (otherParticipant) {
      const otherUser = otherParticipant.user;
      return otherUser?.first_name && otherUser?.last_name
        ? `${otherUser.first_name} ${otherUser.last_name}`
        : otherUser?.email;
    }
    
    return 'Conversation';
  };
  
  // Get participants info for the subtitle
  const getParticipantsInfo = () => {
    if (conversation?.is_group_chat && conversation?.participants) {
      return `${conversation.participants.length} participants`;
    }
    
    return ''; // For one-on-one chats, we don't need a subtitle
  };
  
  return (
    <div className="border-b p-4 flex items-center justify-between bg-white">
      <div className="flex items-center">
        {conversation?.is_group_chat ? (
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
            {/* Show first letter of other participant's name with proper null checks */}
            {conversation?.participants?.find(p => p?.user?.id !== currentUser?.id)?.user?.first_name?.[0]?.toUpperCase() || '?'}
          </div>
        )}
        
        <div>
          <h2 className="font-medium">{getConversationName()}</h2>
          {getParticipantsInfo() && (
            <p className="text-sm text-gray-500">{getParticipantsInfo()}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Pinned messages button */}
        <button 
          onClick={togglePinnedMessages}
          className="p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded-full relative"
          title="Pinned messages"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          
          {pinnedMessages?.length > 0 && (
            <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {pinnedMessages.length}
            </span>
          )}
        </button>
        
        {/* Conversation info button */}
        <button 
          onClick={() => setShowInfo(true)}
          className="p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded-full"
          title="Conversation info"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
      
      {/* Conversation info modal */}
      {showInfo && (
        <ConversationInfoModal 
          conversation={conversation} 
          onClose={() => setShowInfo(false)} 
        />
      )}
    </div>
  );
};

export default ConversationHeader;