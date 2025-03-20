import React, { useState } from 'react';

const Reports = () => {
  // Mock data for reports
  const [reportPeriod, setReportPeriod] = useState('last30');
  
  // Mocked data for charts and stats
  const performanceData = {
    last7: [
      { date: '2025-03-14', completed: 3, created: 5 },
      { date: '2025-03-15', completed: 2, created: 3 },
      { date: '2025-03-16', completed: 5, created: 4 },
      { date: '2025-03-17', completed: 4, created: 6 },
      { date: '2025-03-18', completed: 7, created: 3 },
      { date: '2025-03-19', completed: 3, created: 4 },
      { date: '2025-03-20', completed: 4, created: 5 },
    ],
    last30: [
      { date: 'Week 1', completed: 15, created: 21 },
      { date: 'Week 2', completed: 18, created: 19 },
      { date: 'Week 3', completed: 22, created: 17 },
      { date: 'Week 4', completed: 19, created: 23 },
    ],
    last90: [
      { date: 'January', completed: 57, created: 64 },
      { date: 'February', completed: 68, created: 72 },
      { date: 'March', completed: 74, created: 69 },
    ],
  };
  
  const projectStats = [
    { id: 'p1', name: 'Website Redesign', progress: 65, tasks: 24, completedTasks: 16, status: 'In Progress' },
    { id: 'p2', name: 'Marketing Campaign', progress: 40, tasks: 18, completedTasks: 7, status: 'In Progress' },
    { id: 'p3', name: 'Product Launch', progress: 15, tasks: 32, completedTasks: 5, status: 'In Progress' },
    { id: 'p4', name: 'Client Onboarding Process', progress: 90, tasks: 12, completedTasks: 11, status: 'Almost Done' },
    { id: 'p5', name: 'Internal Tool Development', progress: 0, tasks: 18, completedTasks: 0, status: 'Not Started' },
  ];
  
  const teamPerformance = [
    { member: 'John Doe', tasksAssigned: 8, tasksCompleted: 5, onTime: 4, late: 1 },
    { member: 'Sarah Johnson', tasksAssigned: 12, tasksCompleted: 7, onTime: 5, late: 2 },
    { member: 'Michael Chen', tasksAssigned: 15, tasksCompleted: 10, onTime: 8, late: 2 },
    { member: 'Emily Rodriguez', tasksAssigned: 9, tasksCompleted: 8, onTime: 7, late: 1 },
    { member: 'Alex Kim', tasksAssigned: 7, tasksCompleted: 3, onTime: 3, late: 0 },
  ];
  
  // Calculate summary statistics
  const totalTasks = projectStats.reduce((sum, project) => sum + project.tasks, 0);
  const completedTasks = projectStats.reduce((sum, project) => sum + project.completedTasks, 0);
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const currentPeriodData = performanceData[reportPeriod];
  const totalCreated = currentPeriodData.reduce((sum, day) => sum + day.created, 0);
  const totalCompleted = currentPeriodData.reduce((sum, day) => sum + day.completed, 0);
  
  const onTimeCompletions = teamPerformance.reduce((sum, member) => sum + member.onTime, 0);
  const lateCompletions = teamPerformance.reduce((sum, member) => sum + member.late, 0);
  const onTimeRate = (onTimeCompletions + lateCompletions) > 0 
    ? Math.round((onTimeCompletions / (onTimeCompletions + lateCompletions)) * 100) 
    : 0;
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">
              Reports
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              View detailed analytics and performance reports.
            </p>
          </div>
          <div className="mt-4 flex space-x-3 md:mt-0">
            <select 
              className="input" 
              value={reportPeriod} 
              onChange={(e) => setReportPeriod(e.target.value)}
            >
              <option value="last7">Last 7 Days</option>
              <option value="last30">Last 30 Days</option>
              <option value="last90">Last 90 Days</option>
            </select>
            <button type="button" className="btn btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Export
            </button>
          </div>
        </div>
        
        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Tasks */}
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Tasks
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {totalTasks}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="font-medium text-gray-500">
                  {completedTasks} completed
                </span>
              </div>
            </div>
          </div>
          
          {/* Completion Rate */}
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Completion Rate
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {completionRate}%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className={`font-medium ${completionRate > 50 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {completionRate > 50 ? 'On track' : 'Needs improvement'}
                </span>
              </div>
            </div>
          </div>
          
          {/* New vs. Completed */}
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      New vs. Completed
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {totalCreated} / {totalCompleted}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className={`font-medium ${totalCompleted >= totalCreated ? 'text-green-600' : 'text-yellow-600'}`}>
                  {totalCompleted >= totalCreated ? 'Keeping up with new tasks' : 'Accumulating tasks'}
                </span>
              </div>
            </div>
          </div>
          
          {/* On-time Completion */}
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      On-time Rate
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {onTimeRate}%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="font-medium text-gray-500">
                  {onTimeCompletions} on time, {lateCompletions} late
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Task Completion Chart */}
        <div className="mt-8 bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Task Completion Trends</h3>
            <p className="mt-1 text-sm text-gray-500">
              New tasks created vs. completed tasks over time
            </p>
          </div>
          <div className="px-6 py-5">
            {/* In a real app, we would use a chart library like Chart.js or Recharts */}
            <div className="h-64 flex items-end">
              {currentPeriodData.map((day, index) => (
                <div key={index} className="w-full h-full flex flex-col items-center justify-end">
                  <div className="flex flex-col items-center justify-end space-y-1 w-full">
                    <div 
                      className="w-8 bg-blue-500 rounded-t"
                      style={{ height: `${(day.created / Math.max(...currentPeriodData.map(d => Math.max(d.created, d.completed)))) * 100}%` }}
                    ></div>
                    <div 
                      className="w-8 bg-green-500 rounded-t"
                      style={{ height: `${(day.completed / Math.max(...currentPeriodData.map(d => Math.max(d.created, d.completed)))) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left">
                    {day.date}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-center space-x-8">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Created</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Completed</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Project Progress */}
        <div className="mt-8 bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Project Progress</h3>
            <p className="mt-1 text-sm text-gray-500">
              Current status of active projects
            </p>
          </div>
          <div className="px-6 py-5">
            <div className="space-y-4">
              {projectStats.map(project => (
                <div key={project.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-base font-medium text-gray-900">{project.name}</h4>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      project.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                      project.status === 'Almost Done' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="flex justify-between mb-1 text-xs text-gray-500">
                    <span>Progress ({project.progress}%)</span>
                    <span>{project.completedTasks}/{project.tasks} tasks</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Team Performance */}
        <div className="mt-8 bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Team Performance</h3>
            <p className="mt-1 text-sm text-gray-500">
              Task completion metrics by team member
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team Member
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tasks Assigned
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tasks Completed
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion Rate
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    On-time / Late
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamPerformance.map((member, index) => {
                  const completionRate = member.tasksAssigned > 0 
                    ? Math.round((member.tasksCompleted / member.tasksAssigned) * 100) 
                    : 0;
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{member.member}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{member.tasksAssigned}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{member.tasksCompleted}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{completionRate}%</div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div 
                            className={`h-1.5 rounded-full ${
                              completionRate >= 80 ? 'bg-green-600' :
                              completionRate >= 60 ? 'bg-yellow-600' :
                              'bg-red-600'
                            }`}
                            style={{ width: `${completionRate}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <span className="text-green-600">{member.onTime}</span> / <span className="text-red-600">{member.late}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;