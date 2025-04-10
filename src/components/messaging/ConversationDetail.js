// src/components/messaging/ConversationDetail.js
import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { 
  getConversation, 
  getMessages, 
  markAsRead,
  getPinnedMessages
} from '../../services/messagingService';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ConversationHeader from './ConversationHeader';
import PinnedMessages from './PinnedMessages';

const ConversationDetail = ({ conversationId, onConversationUpdate }) => {
  const { user } = useContext(AuthContext);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef(null);
  
  // Function declarations for dependency array
  const fetchConversation = async () => {
    try {
      const response = await getConversation(conversationId);
      setConversation(response.data);
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  };
  
  const fetchMessages = async (loadMore = false) => {
    try {
      if (!loadMore) setLoading(true);
      
      const response = await getMessages(conversationId, loadMore ? page + 1 : 1);
      
      const newMessages = response.data.results;
      
      if (loadMore) {
        setMessages(prevMessages => [...newMessages, ...prevMessages]);
        setPage(page + 1);
      } else {
        setMessages(newMessages);
        setPage(1);
      }
      
      setHasMore(!!response.data.next);
      
      // Mark messages as read automatically
      newMessages.forEach(message => {
        if (message.sender.id !== user.id && !message.read_by.some(read => read.user.id === user.id)) {
          markAsRead(message.id);
        }
      });
      
      // Update conversation list to reflect read messages
      onConversationUpdate();
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchPinnedMessages = async () => {
    try {
      const response = await getPinnedMessages(conversationId);
      setPinnedMessages(response.data);
    } catch (error) {
      console.error('Error fetching pinned messages:', error);
    }
  };
  
  // Fetch conversation details
  useEffect(() => {
    fetchConversation();
    fetchMessages();
    fetchPinnedMessages();
    
    // Reset state when conversation changes
    setPage(1);
    setHasMore(true);
    setMessages([]);
    setPinnedMessages([]);
    setShowPinnedMessages(false);
    setTypingUsers([]);
  }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && !loading) {
      scrollToBottom();
    }
  }, [messages, loading]);
  
  // Clear typing indicators after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setTypingUsers([]);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [typingUsers]);
  
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchMessages(true);
    }
  };
  
  const handleSendMessage = (newMessage) => {
    setMessages(prevMessages => [...prevMessages, {
      ...newMessage,
      conversation: parseInt(conversationId),
      read_by: [{
        user: user
      }],
      sender: user,
      reactions: [],
      attachments: []
    }]);
    
    // Scroll to bottom after sending
    setTimeout(scrollToBottom, 100);
  };
  
  const handlePinUnpinMessage = () => {
    fetchPinnedMessages();
  };
  
  const togglePinnedMessages = () => {
    setShowPinnedMessages(!showPinnedMessages);
  };
  
  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <ConversationHeader 
        conversation={conversation} 
        pinnedMessages={pinnedMessages}
        togglePinnedMessages={togglePinnedMessages}
      />
      
      {showPinnedMessages && (
        <PinnedMessages 
          pinnedMessages={pinnedMessages} 
          onClose={() => setShowPinnedMessages(false)}
        />
      )}
      
      <div className="flex-1 p-4 overflow-y-auto">
        {hasMore && (
          <div className="text-center mb-4">
            <button 
              onClick={handleLoadMore}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
            >
              Load more messages
            </button>
          </div>
        )}
        
        <MessageList 
          messages={messages} 
          currentUser={user} 
          onPinUnpinMessage={handlePinUnpinMessage}
        />
        
        {typingUsers.length > 0 && (
          <div className="text-gray-500 text-sm italic mb-2">
            {typingUsers.map(user => user.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <MessageInput 
        conversationId={conversationId} 
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default ConversationDetail;