import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { login } from '../features/auth/authSlice'


export default function Login() {
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const dispatch = useDispatch()


const handleSubmit = (e) => {
e.preventDefault()
dispatch(login({ email, password }))
}


return (
<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
<form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded-lg shadow">
<h2 className="text-xl font-semibold mb-4">Sign in</h2>
<label className="block text-sm">Email</label>
<input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border px-3 py-2 rounded mb-3" />
<label className="block text-sm">Password</label>
<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border px-3 py-2 rounded mb-4" />
<button className="w-full py-2 rounded bg-indigo-600 text-white">Login</button>
</form>
</div>
)
}