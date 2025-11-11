import React, { useState, useEffect } from 'react';
export default function LeadForm({ initial = {}, onSubmit, onCancel }) {
const [form, setForm] = useState({ name: '', email: '', phone: '', status: 'New', ownerId: '', description: '', ...initial });
useEffect(() => setForm(f => ({ ...f, ...initial })), [initial]);
const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
const submit = (e) => { e.preventDefault(); onSubmit(form); };
return (
<form onSubmit={submit} className="space-y-2 p-4 bg-white rounded shadow">
<input name="name" value={form.name} onChange={change} placeholder="Name" className="w-full p-2 border rounded" />
<input name="email" value={form.email || ''} onChange={change} placeholder="Email" className="w-full p-2 border rounded" />
<input name="phone" value={form.phone || ''} onChange={change} placeholder="Phone" className="w-full p-2 border rounded" />
<select name="status" value={form.status} onChange={change} className="w-full p-2 border rounded">
<option>New</option><option>Contacted</option><option>Qualified</option><option>Proposal</option><option>Won</option><option>Lost</option>
</select>
<textarea name="description" value={form.description || ''} onChange={change} placeholder="Description" className="w-full p-2 border rounded"></textarea>
<div className="flex gap-2">
<button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
<button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
</div>
</form>
);
}