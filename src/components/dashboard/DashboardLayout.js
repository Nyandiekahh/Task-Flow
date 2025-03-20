import React, { useContext } from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import DashboardHome from './DashboardHome';
import Projects from './Projects';
import Tasks from './Tasks';
import Calendar from './Calendar';
import Team from './Team';
import Reports from './Reports';

const DashboardLayout = () => {
  const { currentUser, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-secondary-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Main content area with routing */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="projects" element={<Projects />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="team" element={<Team />} />
            <Route path="reports" element={<Reports />} />
            {/* Add more routes as needed */}
            <Route path="*" element={<DashboardHome />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;