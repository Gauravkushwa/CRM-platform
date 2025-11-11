import React from "react";

export default function ActivitiesPanel({ lead }) {
  if (!lead) return <p>No lead selected.</p>;

  return (
    <div>
      <h5 className="text-lg font-semibold mb-2">{lead.name}</h5>
      <p className="text-gray-600">Email: {lead.email}</p>
      <p className="text-gray-600">Phone: {lead.phone}</p>
      <p className="text-gray-600 mt-2">
        Status: <span className="font-medium">{lead.status || 'N/A'}</span>
      </p>
      <div className="mt-4 p-3 bg-gray-50 rounded">
        <p className="text-sm text-gray-500">
          (Activity history will appear here.)
        </p>
      </div>
    </div>
  );
}
