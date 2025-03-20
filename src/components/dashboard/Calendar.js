import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Calendar = () => {
  // Current date information
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // State for selected month and year
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  // Mock event data
  const events = [
    { id: 1, title: 'Project Kickoff', date: '2025-03-21', time: '10:00 AM', project: 'Website Redesign', type: 'meeting' },
    { id: 2, title: 'Client Presentation', date: '2025-03-24', time: '2:00 PM', project: 'Marketing Campaign', type: 'presentation' },
    { id: 3, title: 'Team Sync', date: '2025-03-22', time: '9:30 AM', project: 'Product Launch', type: 'meeting' },
    { id: 4, title: 'Quarterly Planning', date: '2025-03-28', time: '1:00 PM', project: 'Internal', type: 'planning' },
    { id: 5, title: 'Deadline: Homepage Draft', date: '2025-03-26', time: '5:00 PM', project: 'Website Redesign', type: 'deadline' },
    { id: 6, title: 'Review Marketing Materials', date: '2025-03-25', time: '11:00 AM', project: 'Marketing Campaign', type: 'review' },
  ];
  
  // Month names for display
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Function to get days in month
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Function to get the day of week the month starts on (0 = Sunday)
  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };
  
  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDayOfMonth = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days = [];
    
    // Add empty cells for days before the first of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };
  
  // Get events for a specific day
  const getEventsForDay = (day) => {
    if (!day) return [];
    
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };
  
  // Navigate to previous month
  const prevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };
  
  // Navigate to next month
  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };
  
  // Get event type color
  const getEventTypeColor = (type) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'presentation':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'planning':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'deadline':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Calendar days
  const calendarDays = generateCalendarDays();
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">
              Calendar
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Schedule and view all your tasks and events.
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link to="/dashboard/tasks/new">
              <button type="button" className="btn btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Event
              </button>
            </Link>
          </div>
        </div>
        
        {/* Calendar controls */}
        <div className="bg-white rounded-t-lg border border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-gray-900">
              {monthNames[selectedMonth]} {selectedYear}
            </h2>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={prevMonth}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => {
                setSelectedMonth(currentMonth);
                setSelectedYear(currentYear);
              }}
              className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Today
            </button>
            <button 
              onClick={nextMonth}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Calendar grid */}
        <div className="bg-white border-x border-b border-gray-200 rounded-b-lg overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
              <div key={i} className="py-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar cells */}
          <div className="grid grid-cols-7 grid-rows-6 h-96 md:h-[36rem]">
            {calendarDays.map((day, index) => {
              const dateStr = day ? `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
              const isToday = day === currentDate.getDate() && 
                             selectedMonth === currentDate.getMonth() && 
                             selectedYear === currentDate.getFullYear();
              const dayEvents = getEventsForDay(day);
              
              return (
                <div 
                  key={index}
                  className={`border-r border-b border-gray-200 p-1 ${!day ? 'bg-gray-50' : ''}`}
                >
                  {day && (
                    <>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm font-medium h-6 w-6 flex items-center justify-center rounded-full ${
                          isToday ? 'bg-primary-600 text-white' : 'text-gray-700'
                        }`}>
                          {day}
                        </span>
                        {dayEvents.length > 0 && (
                          <button className="text-xs text-gray-500 hover:text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                        )}
                      </div>
                      <div className="space-y-1 overflow-y-auto max-h-20 md:max-h-40">
                        {dayEvents.slice(0, 3).map(event => (
                          <div 
                            key={event.id}
                            className={`p-1 rounded text-xs border ${getEventTypeColor(event.type)}`}
                          >
                            <div className="font-medium truncate">{event.title}</div>
                            <div className="truncate">{event.time}</div>
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-center text-gray-500">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Upcoming events */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Events</h3>
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
            {events
              .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
              .slice(0, 5)
              .map(event => (
                <div key={event.id} className="p-4 hover:bg-gray-50">
                  <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                      <h4 className="text-base font-medium text-gray-900">{event.title}</h4>
                      <div className="mt-1 text-sm text-gray-500">
                        <span className="font-medium">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span> at {event.time}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">{event.project}</div>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;