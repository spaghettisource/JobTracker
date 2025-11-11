import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./modules/auth/pages/LoginPage";
import DashboardPage from "./modules/applications/pages/DashboardPage";
import ProtectedRoute from "./modules/shared/components/ProtectedRoute";
import { useAuthInitializer } from "./modules/auth/hooks/useAuthInitializer";
import HrDashboardPage from "./modules/applications/pages/HrDashboardPage";

function App() {
  // initialize auth store on app start
  useAuthInitializer();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hrdashboard"
          element={
            <ProtectedRoute>
              <HrDashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
