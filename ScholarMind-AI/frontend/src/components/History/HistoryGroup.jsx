import React from 'react';
export default function HistoryGroup({ title, children }) {
  return (
    <div className="mb-6">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">{title}</h4>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
