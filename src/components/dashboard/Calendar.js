import React, { useState, useEffect, useCallback } from 'react';
import { format, parseISO, startOfMonth, endOfMonth, addMonths, subMonths, 
         isSameDay, isSameMonth, getDay, getDaysInMonth, isAfter, startOfDay } from 'date-fns';
import axios from 'axios';
import { toast } from 'react-toastify';

// Event form modal component
const EventFormModal = ({ isOpen, onClose, selectedDate, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    event_type: 'meeting'
  });

  // Event types 
  const eventTypes = [
    { value: 'meeting', label: 'Meeting' },
    { value: 'task', label: 'Task' },
    { value: 'deadline', label: 'Deadline' },
    { value: 'reminder', label: 'Reminder' }
  ];

  // Set default times when modal opens with a selected date
  useEffect(() => {
    if (selectedDate) {
      const startTime = new Date(selectedDate);
      startTime.setHours(9, 0, 0);
      
      const endTime = new Date(selectedDate);
      endTime.setHours(10, 0, 0);
      
      setFormData({
        title: '',
        description: '',
        start_time: format(startTime, "yyyy-MM-dd'T'HH:mm"),
        end_time: format(endTime, "yyyy-MM-dd'T'HH:mm"),
        location: '',
        event_type: 'meeting'
      });
    }
  }, [selectedDate, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Format data for API
    const apiData = {
      ...formData,
      start_time: formData.start_time + ':00Z',
      end_time: formData.end_time + ':00Z'
    };
    
    onSave(apiData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">New Event</h3>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
              Title*
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.title}
              onChange={handleChange}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="3"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
          
          <div className="flex space-x-4 mb-4">
            <div className="w-1/2">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="start_time">
                Start*
              </label>
              <input
                id="start_time"
                name="start_time"
                type="datetime-local"
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.start_time}
                onChange={handleChange}
                min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
              />
            </div>
            <div className="w-1/2">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="end_time">
                End*
              </label>
              <input
                id="end_time"
                name="end_time"
                type="datetime-local"
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.end_time}
                onChange={handleChange}
                min={formData.start_time}
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
              Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.location}
              onChange={handleChange}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="event_type">
              Event Type
            </label>
            <select
              id="event_type"
              name="event_type"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.event_type}
              onChange={handleChange}
            >
              {eventTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Event details modal component
const EventDetailsModal = ({ isOpen, onClose, event, onDelete }) => {
  if (!isOpen || !event) return null;

  // Format dates for display
  const startDate = parseISO(event.start_time);
  const endDate = parseISO(event.end_time);
  
  // Get event type color
  const getEventTypeColor = (type) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800';
      case 'task': return 'bg-green-100 text-green-800';
      case 'deadline': return 'bg-red-100 text-red-800';
      case 'reminder': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{event.title}</h3>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(event.event_type)}`}>
            {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
          </span>
        </div>
        
        <div className="mb-4">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-700">
                {format(startDate, 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-sm text-gray-600">
                {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
              </p>
            </div>
          </div>
        </div>
        
        {event.location && (
          <div className="mb-4">
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm text-gray-600">{event.location}</p>
            </div>
          </div>
        )}
        
        {event.description && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
            <p className="text-sm text-gray-600 whitespace-pre-line">{event.description}</p>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex justify-end mt-6 space-x-2">
          <button
            onClick={onDelete}
            className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="px-3 py-2 bg-gray-300 text-gray-800 text-sm rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Calendar component
const Calendar = () => {
  // State variables
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [token, setToken] = useState(null);
  
  // Set up axios with token
  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (authToken) {
      setToken(authToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    }
  }, []);

  // Fetch events from API
  const fetchEvents = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const start = format(startOfMonth(currentDate), "yyyy-MM-dd'T'00:00:00'Z'");
      const end = format(endOfMonth(currentDate), "yyyy-MM-dd'T'23:59:59'Z'");
      
      const response = await axios.get(`/api/calendar/events/by_date_range/?start=${start}&end=${end}`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [currentDate, token]);

  // Load events when component mounts or currentDate changes
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Handle form submission to create event
  const handleSaveEvent = async (eventData) => {
    try {
      await axios.post('/api/calendar/events/', eventData);
      toast.success('Event created successfully');
      
      // Refresh events and close modal
      fetchEvents();
      setIsModalOpen(false);
      setSelectedDate(null);
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to create event');
    }
  };

  // Handle event deletion
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    
    try {
      await axios.delete(`/api/calendar/events/${selectedEvent.id}/`);
      toast.success('Event deleted successfully');
      
      // Refresh events and close modal
      fetchEvents();
      setIsDetailsModalOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  // Navigate to previous/next month
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Get events for a specific day
  const getEventsForDay = (date) => {
    if (!date) return [];
    
    return events.filter(event => {
      const eventStart = parseISO(event.start_time);
      return isSameDay(date, eventStart);
    });
  };

  // Generate calendar grid
  const renderCalendarGrid = () => {
    // Get days in month and day of week the month starts on (0 = Sunday)
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getDay(startOfMonth(currentDate));
    
    const days = [];
    
    // Add empty cells for days before the first of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      days.push(date);
    }
    
    // Add empty cells at the end to complete the grid (if needed)
    const totalCells = Math.ceil(days.length / 7) * 7;
    for (let i = days.length; i < totalCells; i++) {
      days.push(null);
    }
    
    const today = new Date();
    
    return (
      <div className="grid grid-cols-7 h-96">
        {days.map((date, index) => {
          const isToday = date ? isSameDay(date, today) : false;
          const isCurrentMonth = date ? isSameMonth(date, currentDate) : false;
          const isPastDay = date ? isSameDay(date, today) ? false : !isAfter(date, today) : false;
          const dayEvents = date ? getEventsForDay(date) : [];
          
          return (
            <div 
              key={index}
              className={`border p-1 ${
                !date ? 'bg-gray-50' : 
                isPastDay ? 'bg-gray-100 text-gray-400' : 
                isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
              }`}
            >
              {date && (
                <>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm h-6 w-6 flex items-center justify-center rounded-full ${
                      isToday ? 'bg-blue-600 text-white' : ''
                    }`}>
                      {date.getDate()}
                    </span>
                    {!isPastDay && (
                      <button 
                        className="text-xs text-gray-500 hover:text-gray-700"
                        onClick={() => {
                          setSelectedDate(date);
                          setIsModalOpen(true);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-1 overflow-y-auto max-h-20">
                    {dayEvents.map(event => {
                      // Get appropriate event color based on type
                      const getEventTypeColor = (type) => {
                        switch (type) {
                          case 'meeting': return 'bg-blue-100 text-blue-800';
                          case 'task': return 'bg-green-100 text-green-800';
                          case 'deadline': return 'bg-red-100 text-red-800';
                          case 'reminder': return 'bg-yellow-100 text-yellow-800';
                          default: return 'bg-gray-100 text-gray-800';
                        }
                      };
                      
                      return (
                        <div 
                          key={event.id}
                          className={`p-1 rounded text-xs cursor-pointer hover:opacity-80 ${getEventTypeColor(event.event_type)}`}
                          onClick={() => {
                            setSelectedEvent(event);
                            setIsDetailsModalOpen(true);
                          }}
                        >
                          <div className="font-medium truncate">{event.title}</div>
                          <div className="truncate">
                            {format(parseISO(event.start_time), 'h:mm a')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Calendar header with month name and navigation buttons
  const renderCalendarHeader = () => {
    return (
      <div className="bg-white rounded-t-lg border border-gray-200 p-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex space-x-2">
          <button 
            onClick={prevMonth}
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="Previous month"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Today
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="Next month"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  // Main component render
  return (
    <div className="py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          </div>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              setSelectedDate(new Date());
              setIsModalOpen(true);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Event
          </button>
        </div>
        
        {/* Calendar */}
        {renderCalendarHeader()}
        
        <div className="bg-white border-x border-b border-gray-200 rounded-b-lg overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
              <div key={i} className="py-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          
          {/* Loading state */}
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            renderCalendarGrid()
          )}
        </div>
        
        {/* Event form modal */}
        <EventFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDate(null);
          }}
          selectedDate={selectedDate}
          onSave={handleSaveEvent}
        />
        
        {/* Event details modal */}
        <EventDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedEvent(null);
          }}
          event={selectedEvent}
          onDelete={handleDeleteEvent}
        />
      </div>
    </div>
  );
};

export default Calendar;