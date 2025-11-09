import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Login from './pages/Login'
import Register from './pages/Register'
import Leads from './pages/Leads'
import LeadDetail from './pages/LeadDetail'
import Navbar from './components/Navbar'
import { initSocket, disconnectSocket } from './services/socket'
import ActivitiesPage from './pages/ActivitiesPage'

export default function App(){
  const auth = useSelector(state => state.auth)
  const nav = useNavigate()

  useEffect(() => {
    if (auth.token && auth.user) {
      initSocket(auth.token, auth.user.id)
    } else {
      disconnectSocket()
    }
    // cleanup on unmount
    return () => disconnectSocket()
  }, [auth.token, auth.user])

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Navigate to="/leads" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/leads" element={auth.token ? <Leads /> : <Navigate to="/login" />} />
          <Route path="/leads/:id" element={auth.token ? <LeadDetail /> : <Navigate to="/login" />} />
          <Route path='/activities' element={<ActivitiesPage />} />
        </Routes>
      </div>
    </div>
  )
}
