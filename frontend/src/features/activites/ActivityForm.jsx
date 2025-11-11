import React, { useState, useEffect } from 'react';
export default function ActivityForm({ initial = {}, onSubmit, onCancel }) {
const [form, setForm] = useState({ type: 'Note', content: '', ...initial });
useEffect(() => setForm(f => ({ ...f, ...initial })), [initial]);
const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
const submit = (e) => { e.preventDefault(); onSubmit(form); };
return (
<form onSubmit={submit} className="space-y-2 p-3 bg-white rounded shadow">
<select name="type" value={form.type} onChange={change} className="w-full p-2 border rounded">
<option>Note</option><option>Call</option><option>Meeting</option><option>Email</option><option>StatusChange</option>
</select>
<textarea name="content" value={form.content} onChange={change} placeholder="Content" className="w-full p-2 border rounded"></textarea>
<div className="flex gap-2">
<button type="submit" className="px-3 py-1 bg-green-600 text-white rounded">Save</button>
<button type="button" onClick={onCancel} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
</div>
</form>
);
}