import React from 'react';
import { MessageSquare } from 'lucide-react';
export default function HistoryItem({ item }) {
  return (
    <div className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-md cursor-pointer group">
      <MessageSquare size={16} className="text-gray-400 group-hover:text-white" />
      <span className="text-sm text-gray-300 group-hover:text-white flex-1 truncate">{item.title}</span>
    </div>
  );
}
