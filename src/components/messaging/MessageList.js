import React, { useState } from 'react';
import { format } from 'date-fns';
import MessageActions from './MessageActions';

const MessageList = ({ messages, currentUser, onPinUnpinMessage }) => {
  const [activeMessage, setActiveMessage] = useState(null);
  
  // More comprehensive check for messages
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-center p-4 text-gray-500">
        <div>
          <p className="text-lg mb-2">No messages yet</p>
          <p className="text-sm">Start the conversation by sending a message below</p>
        </div>
      </div>
    );
  }
  
  // Group messages by date with additional error handling
  const groupedMessages = messages.reduce((groups, message) => {
    // Skip messages without a timestamp
    if (!message || !message.timestamp) return groups;
    
    const date = new Date(message.timestamp).toLocaleDateString();
    
    if (!groups[date]) {
      groups[date] = [];
    }
    
    groups[date].push(message);
    return groups;
  }, {});
  
  // Format timestamp
  const formatMessageTime = (timestamp) => {
    return format(new Date(timestamp), 'h:mm a');
  };
  
  // Check if a message should show sender info or be grouped with previous
  const shouldShowSender = (messages, index) => {
    if (index === 0) return true;
    
    const currentMessage = messages[index];
    const previousMessage = messages[index - 1];
    
    // Additional null checks
    if (!currentMessage || !previousMessage) return true;
    if (!currentMessage.sender || !previousMessage.sender) return true;
    
    // If sender changes, show the sender
    if (currentMessage.sender.id !== previousMessage.sender.id) return true;
    
    // If more than 5 minutes between messages, show the sender
    const currentTime = new Date(currentMessage.timestamp).getTime();
    const previousTime = new Date(previousMessage.timestamp).getTime();
    const fiveMinutes = 5 * 60 * 1000;
    
    return (currentTime - previousTime) > fiveMinutes;
  };
  
  return (
    <div>
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date}>
          <div className="text-center my-4">
            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm">
              {new Date(date).toLocaleDateString(undefined, { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric',
                year: new Date(date).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
              })}
            </span>
          </div>
          
          {dateMessages.map((message, index) => {
            // Extensive validation of message and sender
            if (!message || !message.sender || !currentUser) {
              console.warn('Invalid message or user data:', { message, currentUser });
              return null;
            }
            
            // Defensive checks for sender and current user
            const isCurrentUser = message.sender.id === currentUser.id;
            const showSender = shouldShowSender(dateMessages, index);
            
            return (
              <div
                key={message.id || `message-${index}`}
                className={`mb-4 relative group ${isCurrentUser ? 'text-right' : 'text-left'}`}
                onMouseEnter={() => setActiveMessage(message.id)}
                onMouseLeave={() => setActiveMessage(null)}
              >
                {showSender && !isCurrentUser && (
                  <div className="text-sm font-medium mb-1">
                    {message.sender.first_name || message.sender.email || 'Unknown Sender'}
                  </div>
                )}
                
                <div className="flex items-end">
                  {!isCurrentUser && showSender && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 mr-2 flex-shrink-0 flex items-center justify-center">
                      {message.sender.first_name ? message.sender.first_name[0].toUpperCase() : '?'}
                    </div>
                  )}
                  
                  <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                    <div 
                      className={`inline-block rounded-lg px-4 py-2 max-w-xs sm:max-w-md break-words ${
                        isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <div>{message.content || 'No message content'}</div>
                      
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2">
                          {message.attachments.map((attachment, attachIndex) => (
                            <div key={attachment.id || `attachment-${attachIndex}`} className="text-sm">
                              <a 
                                href={attachment.file} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={`flex items-center space-x-1 ${isCurrentUser ? 'text-blue-100' : 'text-blue-500'}`}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                <span>{attachment.file_name || 'Attachment'}</span>
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-1">
                      {message.timestamp ? formatMessageTime(message.timestamp) : 'Unknown time'}
                      {message.edited_at && <span className="ml-1">(edited)</span>}
                      {message.read_by && message.read_by.length > 0 && isCurrentUser && (
                        <span className="ml-1">• Read</span>
                      )}
                    </div>
                    
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="flex mt-1 space-x-1">
                        {Object.entries(
                          message.reactions.reduce((acc, reaction) => {
                            if (reaction && reaction.reaction) {
                              acc[reaction.reaction] = (acc[reaction.reaction] || 0) + 1;
                            }
                            return acc;
                          }, {})
                        ).map(([reaction, count]) => (
                          <div key={reaction} className="bg-gray-100 rounded-full px-2 py-1 text-xs">
                            {reaction} {count > 1 && count}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {activeMessage === message.id && (
                    <MessageActions 
                      message={message} 
                      isCurrentUser={isCurrentUser} 
                      onPinUnpinMessage={onPinUnpinMessage}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default MessageList;