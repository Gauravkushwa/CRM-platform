import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { register } from '../features/auth/authSlice'


export default function Register() {
const [name, setName] = useState('')
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [role, setRole] = useState('user')
const dispatch = useDispatch()


const handleSubmit = (e) => {
e.preventDefault()
dispatch(register({ name, email, password, role }))
}


return (
<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
<form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded-lg shadow">
<h2 className="text-xl font-semibold mb-4">Create an account</h2>


<label className="block text-sm">Name</label>
<input value={name} onChange={(e) => setName(e.target.value)} className="w-full border px-3 py-2 rounded mb-3" />


<label className="block text-sm">Email</label>
<input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border px-3 py-2 rounded mb-3" />


<label className="block text-sm">Password</label>
<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border px-3 py-2 rounded mb-3" />


<label className="block text-sm">Role</label>
<select value={role} onChange={(e) => setRole(e.target.value)} className="w-full border px-3 py-2 rounded mb-4">
<option value="user">User</option>
<option value="sales">Sales</option>
<option value="admin">Admin</option>
</select>


<button className="w-full py-2 rounded bg-indigo-600 text-white">Register</button>
</form>
</div>
)
}