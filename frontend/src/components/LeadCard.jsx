import React from 'react'
import { Link } from 'react-router-dom'

export default function LeadCard({ lead }){
  return (
    <Link to={`/leads/${lead.id}`} className="block bg-white p-3 rounded shadow hover:shadow-md transition">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-semibold">{lead.name}</div>
          <div className="text-sm text-gray-500">{lead.email || lead.phone}</div>
        </div>
        <div className="text-sm text-gray-700">{lead.status}</div>
      </div>
    </Link>
  )
}
