import React from 'react';
import { Download, Trash2, Edit } from 'lucide-react';
export default function PaperActions() {
  return (
    <div className="flex gap-2">
      <button className="p-2 hover:bg-gray-700 rounded"><Edit size={16}/></button>
      <button className="p-2 hover:bg-gray-700 rounded"><Download size={16}/></button>
      <button className="p-2 hover:bg-red-900 text-red-400 rounded"><Trash2 size={16}/></button>
    </div>
  );
}
