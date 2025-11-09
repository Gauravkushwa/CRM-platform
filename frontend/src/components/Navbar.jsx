import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import NotificationsDropdown from '../pages/NotificationsDropdown'
import ActivitiesPage from '../pages/ActivitiesPage'

export default function Navbar(){
  const auth = useSelector(s => s.auth)
  const dispatch = useDispatch()
  const nav = useNavigate()

  const doLogout = () => {
    dispatch(logout())
    nav('/login')
  }

  return (
    <div className="bg-white shadow">
      <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="font-bold">CRM</Link>
        <div className="flex items-center gap-4">
          {auth.user ? (
            <>
              <div className="text-sm text-gray-700">Hi, {auth.user.name}</div>
              <Link to="/leads" className="text-sm">Leads</Link>
              <button onClick={doLogout} className="text-xs px-3 py-1 bg-red-500 text-white rounded">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm">Login</Link>
              <Link to="/register" className="text-sm">Register </Link>
            </>
          )}
      <NotificationsDropdown />
        </div>
      </div>
        {/* <ActivitiesPage /> */}
    </div>
  )
}
