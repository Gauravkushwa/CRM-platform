import React from 'react'
import { useSelector } from 'react-redux'
import LeadCard from '../components/leads/LeadCard'
import LeadsList from '../components/leads/ActivityList'


export default function Leads() {
const leads = useSelector((s) => s.leads.items)


return (
<div>
<div className="flex items-center justify-between mb-4">
<h2 className="text-2xl font-semibold">Leads</h2>
</div>


<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
{leads.map((l) => (
<LeadCard key={l.id} lead={l} />
))}
</div>
<LeadsList />
</div>
)
}