// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Navbar from "./components/ui/Navbar";
import Sidebar from "./components/ui/Sidebar";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import LeadDetail from "./pages/LeadDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LeadsPageLayout from "./pages/LeadsPage"; // the layout from above
import PrivateRoute from "./components/PrivateRoute"; // optional helper

export default function App() {
  const auth = useSelector((s) => s.auth);

  // If not logged in, show only auth routes and redirect all other routes to /login
  if (!auth?.user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Logged-in layout
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/leads/:id" element={<LeadDetail />} />

            {/* If you want a layout that wraps dashboard/leads routes, mount it:
                <Route path="/*" element={<LeadsPageLayout />} />
               But avoid duplicate '/leads' routes as above. */}
            <Route path="*" element={<div>Not Found</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
