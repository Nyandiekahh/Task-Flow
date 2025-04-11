// src/components/messaging/ConversationList.js
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { format, isToday, isYesterday } from 'date-fns';
import { AuthContext } from '../../context/AuthContext';

const ConversationList = ({ conversations, selectedConversationId, loading }) => {
  const { currentUser } = useContext(AuthContext);
  
  console.log("ConversationList - Current user:", currentUser);
  console.log("ConversationList - Conversations:", conversations);
  
  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="mb-4">
              <div className="h-12 bg-gray-200 rounded-md mb-2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (!conversations || conversations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No conversations yet</p>
        <p className="text-sm mt-1">Start a new message to begin chatting</p>
      </div>
    );
  }

  // Format timestamp
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else if (date.getFullYear() === new Date().getFullYear()) {
      return format(date, 'MMM d');
    } else {
      return format(date, 'MM/dd/yyyy');
    }
  };
  
  // Get conversation name (either explicit name or other participant's name)
  const getConversationName = (conversation) => {
    if (conversation.is_group_chat && conversation.name) {
      return conversation.name;
    }
    
    // For direct messages, show the other person's name
    if (!currentUser || !conversation.participants) {
      return 'Conversation';
    }
    
    const otherParticipant = conversation.participants.find(
      p => p.user.id !== currentUser.id
    );
    
    if (otherParticipant) {
      const otherUser = otherParticipant.user;
      return otherUser.first_name && otherUser.last_name
        ? `${otherUser.first_name} ${otherUser.last_name}` 
        : otherUser.email;
    }
    
    return 'Conversation';
  };
  
  return (
    <div className="h-full overflow-y-auto">
      {conversations.map((conversation) => {
        const isSelected = selectedConversationId === conversation.id.toString();
        const hasUnread = conversation.unread_count > 0;
        const conversationName = getConversationName(conversation);
        
        return (
          <Link 
            key={conversation.id}
            to={`/dashboard/messages/${conversation.id}`}
            className={`
              block p-4 border-b hover:bg-gray-100 transition
              ${isSelected ? 'bg-blue-50' : ''}
            `}
          >
            <div className="flex justify-between items-start mb-1">
              <h3 className={`font-medium truncate ${hasUnread ? 'font-semibold' : ''}`}>
                {conversationName}
              </h3>
              {conversation.last_message && (
                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                  {formatMessageTime(conversation.last_message.timestamp)}
                </span>
              )}
            </div>
            
            {conversation.last_message ? (
              <p className={`text-sm truncate ${hasUnread ? 'font-semibold text-black' : 'text-gray-600'}`}>
                {conversation.last_message.content}
              </p>
            ) : (
              <p className="text-sm text-gray-500 italic">No messages yet</p>
            )}
            
            {hasUnread && (
              <div className="mt-1 flex justify-end">
                <span className="inline-block bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {conversation.unread_count}
                </span>
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
};

export default ConversationList;