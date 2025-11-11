import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import ActivityList from '../components/leads/ActivityList'


export default function LeadDetail() {
const { id } = useParams()
const lead = useSelector((s) => s.leads.items.find(l => String(l.id) === String(id)))


if (!lead) return <div>Loading...</div>


return (
<div className="space-y-6">
<div className="bg-white p-6 rounded-lg shadow">
<h1 className="text-2xl font-semibold">{lead.title || lead.name}</h1>
<div className="text-sm text-gray-500 mt-2">{lead.company}</div>
<p className="mt-4 text-gray-700">{lead.description || 'No description'}</p>
</div>


<ActivityList activities={lead.history || []} />
</div>
)
}