import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../features/auth/authSlice'


export default function Navbar() {
const dispatch = useDispatch()
const user = useSelector((s) => s.auth.user)


return (
<header className="w-full bg-white shadow-sm">
<div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
<div className="flex items-center gap-3">
<div className="text-2xl font-bold text-indigo-600">CLM</div>
<div className="text-sm text-gray-500">Customer Lifecycle Manager</div>
</div>
<div className="flex items-center gap-4">
<div className="text-sm text-gray-700">{user?.name || 'User'}</div>
<button className="px-3 py-1 rounded-md bg-red-50 text-red-600 text-sm" onClick={() => dispatch(logout())}>Logout</button>
</div>
</div>
</header>
)
}