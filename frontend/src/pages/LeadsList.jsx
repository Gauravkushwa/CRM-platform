// src/pages/LeadsList.jsx  (or src/pages/Leads.jsx if you prefer)
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeads, createLead, updateLead, deleteLead } from '../features/leads/leadsSlice';
import LeadForm from '../components/leads/LeadForm';
import ActivitiesPanel from '../components/ActivitiesPanel'; // keep your import

export default function LeadsList(){
  const dispatch = useDispatch();
  const { items, status: leadsStatus } = useSelector(s => s.leads);
  const auth = useSelector(s => s.auth);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);

  // fetch leads only when user is logged in and data hasn't been fetched
  useEffect(()=>{
    if (!auth?.user) return;
    if (leadsStatus === 'idle') {
      dispatch(fetchLeads());
    }
  }, [dispatch, auth?.user, leadsStatus]);

  const handleCreate = async (data) => {
    try {
      await dispatch(createLead(data)).unwrap();
      setShowCreate(false);
    } catch (err) { console.error('createLead failed', err); }
  };

  const handleUpdate = async (data) => {
    try {
      await dispatch(updateLead({ id: editing.id, data })).unwrap();
      setEditing(null);
    } catch (err) { console.error('updateLead failed', err); }
  };

  const handleDelete = async (id) => {
    if(!confirm('Delete this lead?')) return;
    try {
      await dispatch(deleteLead(id)).unwrap();
      if (selectedLead?.id === id) setSelectedLead(null);
    } catch (err) { console.error('delete failed', err); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Leads</h3>
          <div className="flex gap-2">
            <button onClick={()=>setShowCreate(true)} className="px-3 py-1 bg-blue-600 text-white rounded">New Lead</button>
            <button onClick={()=>dispatch(fetchLeads())} className="px-3 py-1 bg-gray-200 rounded">Refresh</button>
          </div>
        </div>

        {showCreate && <LeadForm onSubmit={handleCreate} onCancel={()=>setShowCreate(false)} />}
        {editing && <LeadForm initial={editing} onSubmit={handleUpdate} onCancel={()=>setEditing(null)} />}

        {leadsStatus === 'loading' ? <p>Loading...</p> : (
          <ul className="space-y-2">
            {items.map(l=> (
              <li key={l.id} className="p-3 bg-white rounded shadow flex justify-between items-start">
                <div className="w-2/3">
                  <div className="font-medium">{l.name} <span className="text-sm text-gray-500">({l.status})</span></div>
                  <div className="text-sm text-gray-600">{l.email} • {l.phone}</div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <div className="flex gap-2">
                    <button onClick={()=>setSelectedLead(l)} className="px-2 py-1 bg-indigo-500 text-white rounded text-sm">Open</button>
                    <button onClick={()=>setEditing(l)} className="px-2 py-1 bg-yellow-400 rounded text-sm">Edit</button>
                    <button onClick={()=>handleDelete(l.id)} className="px-2 py-1 bg-red-500 text-white rounded text-sm">Delete</button>
                  </div>
                  <div className="text-xs text-gray-500">Owner: {l.owner?.name || '—'}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <aside className="bg-white rounded shadow p-4">
        <h4 className="font-semibold mb-2">Details</h4>
        {selectedLead ? (
          <ActivitiesPanel lead={selectedLead} />
        ) : (
          <p className="text-gray-600">Select a lead to see activities and history</p>
        )}
      </aside>
    </div>
  );
}
