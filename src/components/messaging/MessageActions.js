// src/components/messaging/MessageActions.js
import React, { useState } from 'react';
import { 
  reactToMessage, 
  pinMessage, 
  unpinMessage,
  saveMessage,
  unsaveMessage
} from '../../services/messagingService';

const MessageActions = ({ message, isCurrentUser, onPinUnpinMessage }) => {
  const [showReactions, setShowReactions] = useState(false);
  
  const commonReactions = ['👍', '❤️', '😂', '😮', '👏', '🎉'];
  
  const handleReact = async (reaction) => {
    try {
      await reactToMessage(message.id, reaction);
      setShowReactions(false);
      // The update should be handled by the real-time system or a refresh
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };
  
  const handlePin = async () => {
    try {
      const isPinned = message.is_pinned; // This field would need to be added to your backend
      
      if (isPinned) {
        await unpinMessage(message.id);
      } else {
        await pinMessage(message.id);
      }
      
      onPinUnpinMessage();
    } catch (error) {
      console.error('Error pinning/unpinning message:', error);
    }
  };
  
  const handleSave = async () => {
    try {
      const isSaved = message.is_saved; // This field would need to be added to your backend
      
      if (isSaved) {
        await unsaveMessage(message.id);
      } else {
        await saveMessage(message.id);
      }
      
      // UI update should occur via refresh or state management
    } catch (error) {
      console.error('Error saving/unsaving message:', error);
    }
  };
  
  return (
    <div className={`absolute ${isCurrentUser ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} top-0 flex items-center space-x-1 bg-white p-1 rounded-md shadow-md z-10`}>
      <button 
        onClick={() => setShowReactions(!showReactions)} 
        className="p-1 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded"
        title="Add reaction"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      
      <button 
        onClick={handlePin} 
        className="p-1 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded"
        title={message.is_pinned ? "Unpin message" : "Pin message"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      </button>
      
      <button 
        onClick={handleSave} 
        className="p-1 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded"
        title={message.is_saved ? "Unsave message" : "Save message"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      </button>
      
      {showReactions && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-full shadow-lg p-1 flex space-x-1">
          {commonReactions.map(reaction => (
            <button
              key={reaction}
              onClick={() => handleReact(reaction)}
              className="w-8 h-8 hover:bg-gray-100 rounded-full flex items-center justify-center text-lg"
            >
              {reaction}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageActions;