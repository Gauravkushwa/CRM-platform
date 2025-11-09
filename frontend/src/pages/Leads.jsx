import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchLeads } from '../store/slices/leadsSlice'
import LeadCard from '../components/LeadCard'
import { Link } from 'react-router-dom'

export default function Leads(){
  const dispatch = useDispatch()
  const leads = useSelector(s => s.leads.items)
  const loading = useSelector(s => s.leads.loading)

  useEffect(() => {
    dispatch(fetchLeads({ page: 1, pageSize: 50 }))
  }, [dispatch])

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl">Leads</h2>
        <Link to="/leads/new" className="bg-blue-600 text-white px-3 py-1 rounded">New Lead</Link>
      </div>

      {loading ? <div>Loading...</div> : (
        <div className="grid grid-cols-1 gap-3">
          {leads.length === 0 ? <div className="text-gray-500">No leads yet.</div> : leads.map(l => <LeadCard key={l.id} lead={l} />)}
        </div>
      )}
    </div>
  )
}
