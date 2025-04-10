// src/components/messaging/MessageInput.js
import React, { useState, useRef } from 'react';
import { sendMessage, sendMessageWithAttachments, sendTypingIndicator } from '../../services/messagingService';

const MessageInput = ({ conversationId, onSendMessage }) => {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef(null);
  
  // Track typing state and inform server
  let typingTimeout = null;
  const handleTyping = () => {
    if (conversationId) {
      clearTimeout(typingTimeout);
      sendTypingIndicator(conversationId).catch(err => console.error('Error sending typing indicator:', err));
      
      // Clear typing status after 3 seconds of no typing
      typingTimeout = setTimeout(() => {
        // You could send a "stopped typing" signal here if your backend supports it
      }, 3000);
    }
  };
  
  const handleAttachFile = () => {
    fileInputRef.current.click();
  };
  
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    
    // Reset the input to allow selecting the same file again
    e.target.value = null;
  };
  
  const removeFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };
  
  const handleSend = async () => {
    if (!content.trim() && files.length === 0) return;
    
    try {
      setSending(true);
      
      let response;
      
      if (files.length > 0) {
        response = await sendMessageWithAttachments(conversationId, content, files);
      } else {
        response = await sendMessage({ 
          conversation: conversationId, 
          content: content.trim() 
        });
      }
      
      // Call the callback with the new message
      onSendMessage(response.data);
      
      // Clear the input
      setContent('');
      setFiles([]);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };
  
  const handleKeyDown = (e) => {
    // Send message on Enter (without shift key for new line)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <div className="border-t p-4">
      {/* File attachments preview */}
      {files.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div key={index} className="bg-gray-100 rounded-md px-3 py-1 flex items-center text-sm">
              <span className="truncate max-w-xs">{file.name}</span>
              <button 
                onClick={() => removeFile(index)}
                className="ml-2 text-gray-500 hover:text-red-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-end">
        <button 
          onClick={handleAttachFile}
          className="p-2 text-gray-500 hover:text-blue-500 focus:outline-none"
          title="Attach file"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
        />
        
        <div className="flex-1 mx-2">
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              handleTyping();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={1}
            disabled={sending}
          />
        </div>
        
        <button
          onClick={handleSend}
          disabled={sending || (!content.trim() && files.length === 0)}
          className={`p-2 rounded-md focus:outline-none ${
            sending || (!content.trim() && files.length === 0)
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-blue-500 hover:bg-blue-100'
          }`}
          title="Send message"
        >
          {sending ? (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default MessageInput;