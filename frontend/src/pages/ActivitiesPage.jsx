import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchActivities } from "../store/slices/activitiesSlice";

export default function ActivitiesPage() {
  const dispatch = useDispatch();
  const { items, status } = useSelector(state => state.activities);

  useEffect(() => {
    if (status === "idle") dispatch(fetchActivities());
  }, [status, dispatch]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Activity Feed</h1>

      {status === "loading" && <div>Loading activities...</div>}
      {items.length === 0 && status === "succeeded" && <div>No activities found.</div>}

      <ul>
        {items.map(a => (
          <li key={a.id} className="p-3 bg-white border rounded mb-3">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">{a.message}</div>
                <div className="text-sm text-gray-500">{a.type}</div>
              </div>
              <div className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleString()}</div>
            </div>
            {a.leadId && <div className="mt-2 text-sm text-blue-600">Lead ID: {a.leadId}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}
