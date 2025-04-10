// src/components/messaging/NewConversationModal.js
import React, { useState, useEffect } from 'react';
import { getOrganizationUsers, createConversation } from '../../services/messagingService';

const NewConversationModal = ({ onClose, onSuccess, organizationId }) => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchUsers();
  }, [organizationId]);
  
  const fetchUsers = async () => {
    if (!organizationId) return;
    
    try {
      setLoading(true);
      const response = await getOrganizationUsers(organizationId);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleUserSelection = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
      
      // If more than 1 user is selected, default to group chat
      if (selectedUsers.length > 0) {
        setIsGroupChat(true);
      }
    }
  };
  
  const handleCreateConversation = async () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user');
      return;
    }
    
    if (isGroupChat && !groupName.trim()) {
      alert('Please enter a group name');
      return;
    }
    
    try {
      setCreating(true);
      
      const response = await createConversation({
        name: isGroupChat ? groupName.trim() : '',
        organization: organizationId,
        is_group_chat: isGroupChat,
        participant_ids: selectedUsers
      });
      
      onSuccess(response.data);
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Failed to create conversation. Please try again.');
    } finally {
      setCreating(false);
    }
  };
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const fullName = `${user.user?.first_name || ''} ${user.user?.last_name || ''}`.trim();
    const email = user.user?.email || '';
    
    return (
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">New Conversation</h2>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conversation Type
            </label>
            <div className="flex">
              <button
                type="button"
                onClick={() => setIsGroupChat(false)}
                className={`px-4 py-2 text-sm font-medium ${
                  !isGroupChat 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } rounded-l-md`}
              >
                Direct Message
              </button>
              <button
                type="button"
                onClick={() => setIsGroupChat(true)}
                className={`px-4 py-2 text-sm font-medium ${
                  isGroupChat 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } rounded-r-md`}
              >
                Group Chat
              </button>
            </div>
          </div>
          
          {isGroupChat && (
            <div className="mb-4">
              <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
                Group Name
              </label>
              <input
                type="text"
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter group name"
              />
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              {isGroupChat ? 'Select Participants' : 'Select User'}
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search users..."
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="py-4 text-center text-gray-500">
                Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-4 text-center text-gray-500">
                No users found
              </div>
            ) : (
              <ul className="divide-y">
                {filteredUsers.map((teamMember) => {
                  const user = teamMember.user;
                  const isSelected = selectedUsers.includes(user.id);
                  
                  return (
                    <li 
                      key={user.id} 
                      onClick={() => toggleUserSelection(user.id)}
                      className={`p-3 hover:bg-gray-100 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                          {user.first_name ? user.first_name[0].toUpperCase() : '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {user.first_name && user.last_name 
                              ? `${user.first_name} ${user.last_name}` 
                              : user.email}
                          </p>
                          {user.first_name && user.last_name && (
                            <p className="text-sm text-gray-500 truncate">
                              {user.email}
                            </p>
                          )}
                          {teamMember.title && (
                            <p className="text-xs text-gray-500">
                              {teamMember.title.name}
                            </p>
                          )}
                        </div>
                        <div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="h-4 w-4 text-blue-600 rounded"
                          />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateConversation}
              disabled={creating || selectedUsers.length === 0 || (isGroupChat && !groupName.trim())}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                creating || selectedUsers.length === 0 || (isGroupChat && !groupName.trim())
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewConversationModal;