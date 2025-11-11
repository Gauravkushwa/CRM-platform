// src/pages/LeadsPageLayout.jsx
import React from "react";
import { Link, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Dashboard from "./Dashboard";
import LeadsList from "./LeadsList"; // updated filename

export default function LeadsPage() {
  const auth = useSelector((s) => s.auth);

  if (!auth?.user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow p-4 mb-4 flex justify-between">
        <h1 className="text-2xl font-semibold text-blue-600">CRM</h1>
        <nav className="flex gap-4">
          <Link to="/dashboard" className="hover:text-blue-500">Dashboard</Link>
          <Link to="/leads" className="hover:text-blue-500">Leads</Link>
        </nav>
      </header>

      <main className="p-6">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leads" element={<LeadsList />} />
        </Routes>
      </main>
    </div>
  );
}
