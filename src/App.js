import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Auth Components
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import ResetPassword from './components/auth/ResetPassword';
import ResetPasswordConfirm from './components/auth/ResetPasswordConfirm';

// Landing Components
import Landing from './components/landing/Landing';

// Dashboard Components
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardHome from './components/dashboard/DashboardHome';
import Tasks from './components/dashboard/Tasks';
import TaskDetail from './components/dashboard/TaskDetail';
import NewTask from './components/dashboard/NewTask';
import Projects from './components/dashboard/Projects';
import NewProject from './components/dashboard/NewProject';
import ProjectDetails from './components/dashboard/ProjectDetails'; 
import Team from './components/dashboard/Team';
import TeamInvite from './components/dashboard/TeamInvite';
import Calendar from './components/dashboard/Calendar';
import Reports from './components/dashboard/Reports';
import Settings from './components/dashboard/Settings';
import OrganizationDashboard from './components/dashboard/OrganizationDashboard';

// Onboarding Components
import OnboardingLayout from './components/onboarding/OnboardingLayout';
import Step1OrgDetails from './components/onboarding/Step1OrgDetails';
import Step2TeamMembers from './components/onboarding/Step2TeamMembers';
import Step3Roles from './components/onboarding/Step3Roles';
import Step4Complete from './components/onboarding/Step4Complete';

// Context
import { AuthProvider } from './context/AuthContext';
import { OnboardingProvider } from './context/OnboardingContext';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('token');
  
  if (!isAuthenticated) {
    // Redirect to sign in page if not authenticated
    return <Navigate to="/signin" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <OnboardingProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password-confirm" element={<ResetPasswordConfirm />} />
            
            {/* Onboarding Routes */}
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <OnboardingLayout />
              </ProtectedRoute>
            }>
              <Route path="org-details" element={<Step1OrgDetails />} />
              <Route path="team-members" element={<Step2TeamMembers />} />
              <Route path="roles" element={<Step3Roles />} />
              <Route path="complete" element={<Step4Complete />} />
            </Route>
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardHome />} />
              
              {/* Tasks Routes */}
              <Route path="tasks" element={<Tasks />} />
              <Route path="tasks/new" element={<NewTask />} />
              <Route path="tasks/:id" element={<TaskDetail />} />
              <Route path="tasks/:id/edit" element={<NewTask />} />
              
              {/* Projects Routes */}
              <Route path="projects" element={<Projects />} />
              <Route path="projects/new" element={<NewProject />} />
              <Route path="projects/:id" element={<ProjectDetails />} />
              <Route path="projects/:id/edit" element={<NewProject />} />
              
              {/* Team Routes */}
              <Route path="team" element={<Team />} />
              <Route path="team/invite" element={<TeamInvite />} />
              
              {/* Organization Route */}
              <Route path="organization" element={<OrganizationDashboard />} />
              
              {/* Other Dashboard routes */}
              <Route path="calendar" element={<Calendar />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </OnboardingProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;