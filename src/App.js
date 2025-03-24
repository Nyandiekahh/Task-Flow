import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Landing Page Components
import Landing from './components/landing/Landing';

// Auth Components
import SignUp from './components/auth/SignUp';
import SignIn from './components/auth/SignIn';
import ResetPassword from './components/auth/ResetPassword';
import ResetPasswordConfirm from './components/auth/ResetPasswordConfirm';

// Onboarding Components
import OnboardingLayout from './components/onboarding/OnboardingLayout';
import Step1OrgDetails from './components/onboarding/Step1OrgDetails';
import Step2TeamMembers from './components/onboarding/Step2TeamMembers';
import Step3Roles from './components/onboarding/Step3Roles';
import Step4Complete from './components/onboarding/Step4Complete';

// Main Dashboard
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardHome from './components/dashboard/DashboardHome';
import Tasks from './components/dashboard/Tasks';
import TaskDetail from './components/dashboard/TaskDetail';
import NewTask from './components/dashboard/NewTask';
import Team from './components/dashboard/Team';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { OnboardingProvider } from './context/OnboardingContext';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  // Check if user is authenticated - using 'token' instead of 'accessToken'
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
            {/* Landing Page Route */}
            <Route path="/" element={<Landing />} />
            
            {/* Auth Routes */}
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password-confirm/:uid/:token" element={<ResetPasswordConfirm />} />
            
            {/* Protected Routes */}
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
              <Route path="tasks" element={<Tasks />} />
              <Route path="tasks/new" element={<NewTask />} />
              <Route path="tasks/:id" element={<TaskDetail />} />
              <Route path="tasks/:id/edit" element={<NewTask />} />
              <Route path="team" element={<Team />} />
              {/* Add other dashboard routes as needed */}
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