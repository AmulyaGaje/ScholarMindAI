import React from 'react';
export default function SearchFilters({ activeFilter, setFilter }) {
  const filters = ['All', 'Papers', 'Projects', 'History'];
  return (
    <div className="flex justify-center gap-2 mt-4">
      {filters.map(f => (
        <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1 rounded-full text-sm ${activeFilter === f ? 'bg-accent text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
          {f}
        </button>
      ))}
    </div>
  );
}
