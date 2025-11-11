// src/components/LeadForm.jsx
import React, { useState, useEffect } from 'react';

export default function LeadForm({ initial = null, onSubmit, onCancel }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  // initialize once when editing prop changes (stable dependency)
  useEffect(() => {
    if (initial) setForm({ name: initial.name || '', email: initial.email || '', phone: initial.phone || '' });
    // only run when `initial` reference actually changes
  }, [initial]);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onSubmit) await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 p-3 bg-white rounded shadow">
      <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="w-full p-2 border rounded" />
      <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full p-2 border rounded" />
      <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="w-full p-2 border rounded" />
      <div className="flex gap-2">
        <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
        <button type="button" onClick={onCancel} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
      </div>
    </form>
  );
}
