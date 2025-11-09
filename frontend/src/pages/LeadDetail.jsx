import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchLead, addActivity } from '../store/slices/leadsSlice'

export default function LeadDetail(){
  const { id } = useParams()
  const dispatch = useDispatch()
  const lead = useSelector(s => s.leads.selected)
  const loading = useSelector(s => s.leads.loading)
  const [content, setContent] = useState('')
  const [type, setType] = useState('Note')

  useEffect(() => { dispatch(fetchLead(Number(id))) }, [dispatch, id])

  const submitActivity = async (e) => {
    e.preventDefault()
    if (!content) return
    try {
      await dispatch(addActivity({ type, content, leadId: Number(id) })).unwrap()
      setContent('')
      dispatch(fetchLead(Number(id)))
    } catch (err) { console.error(err) }
  }

  if (loading) return <div>Loading...</div>
  if (!lead) return <div>No lead found.</div>

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded shadow">
        <div className="flex justify-between">
          <div>
            <h2 className="text-lg font-semibold">{lead.name}</h2>
            <div className="text-sm text-gray-500">{lead.email || lead.phone}</div>
            <div className="text-sm text-gray-600 mt-2">{lead.description}</div>
          </div>
          <div className="text-sm">
            Owner: {lead.owner?.name || 'Unknown'}<br/>
            Status: {lead.status}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-3">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Activities</h3>
            {lead.activities.length === 0 && <div className="text-gray-500">No activities yet.</div>}
            <div className="space-y-2">
              {lead.activities.map(a => (
                <div key={a.id} className="p-2 border rounded">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{a.type}</div>
                    <div className="text-xs text-gray-500">{new Date(a.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="text-sm text-gray-700">{a.content}</div>
                  <div className="text-xs text-gray-500 mt-1">By: {a.user?.name || 'Unknown'}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Add Activity</h3>
            <form onSubmit={submitActivity} className="space-y-2">
              <select value={type} onChange={e=>setType(e.target.value)} className="w-full p-2 border rounded">
                <option>Note</option>
                <option>Call</option>
                <option>Meeting</option>
                <option>Email</option>
                <option>StatusChange</option>
              </select>
              <textarea value={content} onChange={e=>setContent(e.target.value)} className="w-full p-2 border rounded" rows="4" />
              <button className="bg-blue-600 text-white px-3 py-1 rounded">Add Activity</button>
            </form>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">History</h3>
            {lead.histories.length === 0 && <div className="text-gray-500">No history.</div>}
            <ul className="space-y-2">
              {lead.histories.map(h => (
                <li key={h.id} className="text-sm text-gray-700">
                  <div className="font-medium">{h.field}</div>
                  <div className="text-xs text-gray-500">{new Date(h.createdAt).toLocaleString()} by {h.user?.name || 'Unknown'}</div>
                  <div className="mt-1">From: {h.oldValue} → To: {h.newValue}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Meta</h3>
            <pre className="text-xs text-gray-600">{JSON.stringify(lead.metadata || {}, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
