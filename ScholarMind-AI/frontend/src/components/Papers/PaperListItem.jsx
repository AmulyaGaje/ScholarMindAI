import React from 'react';
import { FileText, MoreVertical } from 'lucide-react';
export default function PaperListItem({ paper }) {
  return (
    <div className="flex items-center justify-between bg-card p-3 rounded-lg border border-[#2a3347] hover:border-accent transition-colors mb-2">
      <div className="flex items-center gap-4">
        <FileText size={24} className="text-indigo-400" />
        <div>
          <h3 className="font-semibold text-sm">{paper?.title || 'Untitled Paper'}</h3>
          <p className="text-xs text-gray-400">{paper?.authors || 'Unknown Authors'}</p>
        </div>
      </div>
      <button className="text-gray-400 hover:text-white"><MoreVertical size={16}/></button>
    </div>
  );
}
