// src/components/messaging/PinnedMessages.js
import React from 'react';
import { format } from 'date-fns';
import { unpinMessage } from '../../services/messagingService';

const PinnedMessages = ({ pinnedMessages, onClose }) => {
  const handleUnpin = async (pinnedMessageId) => {
    try {
      await unpinMessage(pinnedMessageId);
      // You would typically refresh the pinned messages list here
      // For now, we'll assume the parent component handles this
    } catch (error) {
      console.error('Error unpinning message:', error);
    }
  };

  if (pinnedMessages.length === 0) {
    return (
      <div className="border-b p-4 bg-gray-50">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Pinned Messages</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-gray-500 text-sm">No pinned messages</p>
      </div>
    );
  }

  return (
    <div className="border-b bg-gray-50">
      <div className="p-4 flex justify-between items-center">
        <h3 className="font-medium">Pinned Messages</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="max-h-40 overflow-y-auto px-4 pb-4">
        {pinnedMessages.map((pinnedMessage) => {
          const message = pinnedMessage.message;
          const pinnedDate = new Date(pinnedMessage.pinned_at);
          
          return (
            <div key={pinnedMessage.id} className="bg-white rounded-md p-3 mb-2 shadow-sm relative group">
              <div className="flex items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">
                      {message.sender.first_name && message.sender.last_name 
                        ? `${message.sender.first_name} ${message.sender.last_name}` 
                        : message.sender.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(message.timestamp), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <p className="text-sm truncate">{message.content}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">
                      Pinned by {pinnedMessage.pinned_by.first_name || pinnedMessage.pinned_by.email} on {format(pinnedDate, 'MMM d, yyyy')}
                    </p>
                    <button
                      onClick={() => handleUnpin(message.id)}
                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Unpin message"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PinnedMessages;