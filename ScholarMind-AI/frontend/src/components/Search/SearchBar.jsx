import React from 'react';
import { Search } from 'lucide-react';
export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
      <input type="text" value={value} onChange={onChange} placeholder="Search papers, projects, or history..." 
        className="w-full bg-card border border-gray-700 rounded-full py-3 pl-12 pr-4 text-white focus:border-accent focus:outline-none shadow-lg" />
    </div>
  );
}
