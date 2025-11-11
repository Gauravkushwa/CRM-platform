import React from 'react'
import { Link } from 'react-router-dom'


export default function LeadCard({ lead }) {
return (
<Link to={`/leads/${lead.id}`} className="block p-4 bg-white rounded-lg shadow hover:shadow-md">
<div className="flex items-start justify-between">
<div>
<div className="font-semibold">{lead.title || lead.name}</div>
<div className="text-sm text-gray-500">{lead.company}</div>
</div>
<div className="text-sm text-gray-600">{lead.status}</div>
</div>


<p className="mt-3 text-sm text-gray-600 text-ellipsis">{lead.notes || 'No notes'}</p>


<div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
<div>{lead.owner || 'Unassigned'}</div>
<div>•</div>
<div>{new Date(lead.createdAt).toLocaleDateString()}</div>
</div>
</Link>
)
}