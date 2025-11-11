import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLeads, createLead, updateLead, deleteLead } from "../../features/leads/leadsSlice";
import LeadForm from "./LeadForm";

export default function LeadsList() {
  const dispatch = useDispatch();
  const { items, status } = useSelector(state => state.leads);
  const [editing, setEditing] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => { dispatch(fetchLeads()); }, [dispatch]);

  const handleCreate = async (data) => {
    await dispatch(createLead(data));
    setShowCreate(false);
  };

  const handleUpdate = async (data) => {
    await dispatch(updateLead({ id: editing.id, data }));
    setEditing(null);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this lead?")) return;
    await dispatch(deleteLead(id));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl">Leads</h2>
        <button onClick={() => setShowCreate(true)} className="btn">New Lead</button>
      </div>

      {showCreate && (
        <div className="card p-4 mb-4">
          <LeadForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
        </div>
      )}

      {editing && (
        <div className="card p-4 mb-4">
          <h3>Edit Lead</h3>
          <LeadForm initial={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} />
        </div>
      )}

      {status === "loading" ? <p>Loading…</p> : (
        <ul className="space-y-2">
          {items.map(l => (
            <li key={l.id} className="p-3 bg-white rounded shadow flex justify-between">
              <div>
                <div className="font-medium">{l.name} <span className="text-sm text-gray-500">({l.status})</span></div>
                <div className="text-sm text-gray-600">{l.email} • {l.phone}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(l)} className="btn-sm">Edit</button>
                <button onClick={() => handleDelete(l.id)} className="btn-danger">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
