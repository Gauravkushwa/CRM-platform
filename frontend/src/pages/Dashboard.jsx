import React from 'react'


export default function Dashboard() {
return (
<div className="space-y-6">
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
<div className="bg-white p-4 rounded shadow">Total Leads<br /><div className="text-2xl font-bold">42</div></div>
<div className="bg-white p-4 rounded shadow">Open Opportunities<br /><div className="text-2xl font-bold">8</div></div>
<div className="bg-white p-4 rounded shadow">Won<br /><div className="text-2xl font-bold">12</div></div>
</div>


<div className="bg-white p-6 rounded shadow">Recent Activity (placeholder)</div>
</div>
)
}