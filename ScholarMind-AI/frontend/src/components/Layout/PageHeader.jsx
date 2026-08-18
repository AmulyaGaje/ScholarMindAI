import React from 'react';
export default function PageHeader({ title, children }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}
