import React from 'react';
export default function Tooltip({ children, content }) {
  return (
    <div className="relative group inline-block">
      {children}
      <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
        {content}
      </div>
    </div>
  );
}
