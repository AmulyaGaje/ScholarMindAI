import React from 'react';
import clsx from 'clsx';
export default function Badge({ children, color = 'gray', className }) {
  const colors = {
    indigo: "bg-indigo-900 text-indigo-200",
    purple: "bg-purple-900 text-purple-200",
    emerald: "bg-emerald-900 text-emerald-200",
    amber: "bg-amber-900 text-amber-200",
    gray: "bg-gray-800 text-gray-300"
  };
  return <span className={clsx("px-2 py-1 text-xs rounded-full", colors[color], className)}>{children}</span>;
}
