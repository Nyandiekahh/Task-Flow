// src/routes/OnboardingRoutes.js

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { OnboardingProvider } from '../context/OnboardingContext';
import OnboardingLayout from '../components/onboarding/OnboardingLayout';
import Step1OrgDetails from '../components/onboarding/Step1OrgDetails';
import Step2TeamStructure from '../components/onboarding/Step2TeamStructure';
import Step3AccessControl from '../components/onboarding/Step3AccessControl';
import Step4Complete from '../components/onboarding/Step4Complete';

const OnboardingRoutes = () => {
  return (
    <OnboardingProvider>
      <Routes>
        <Route element={<OnboardingLayout />}>
          <Route index element={<Navigate to="org-details" replace />} />
          <Route path="org-details" element={<Step1OrgDetails />} />
          <Route path="team-members" element={<Step2TeamStructure />} />
          <Route path="roles" element={<Step3AccessControl />} />
          <Route path="complete" element={<Step4Complete />} />
        </Route>
      </Routes>
    </OnboardingProvider>
  );
};

export default OnboardingRoutes;