import React from 'react';
export default function RecentActivity({ activities = [] }) {
  return (
    <div className="bg-card p-5 rounded-lg border border-[#2a3347]">
      <h3 className="font-bold mb-4">Recent Activity</h3>
      {activities.length === 0 ? <p className="text-sm text-gray-500">No recent activity.</p> :
        <ul className="space-y-3">
          {activities.map((act, i) => (
            <li key={i} className="text-sm flex gap-2"><span className="text-gray-400">{act.time}:</span> <span>{act.text}</span></li>
          ))}
        </ul>
      }
    </div>
  );
}
