import React from 'react'
import { NavLink } from 'react-router-dom'


const NavItem = ({ to, children }) => (
<NavLink to={to} className={({ isActive }) => `block py-2 px-3 rounded-md hover:bg-gray-100 ${isActive ? 'bg-white shadow-sm' : ''}`}>
{children}
</NavLink>
)


export default function Sidebar() {
return (
<aside className="w-64 bg-gray-100 p-4 min-h-screen">
<div className="mb-6">
<div className="text-sm text-gray-500">Workspace</div>
<div className="font-semibold text-lg">Sales Team</div>
</div>


<nav className="space-y-2">
<NavItem to="/">Dashboard</NavItem>
<NavItem to="/leads">Leads</NavItem>
</nav>
</aside>
)
}