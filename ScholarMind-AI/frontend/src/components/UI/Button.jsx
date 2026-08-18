import React from 'react';
import clsx from 'clsx';
export default function Button({ children, variant = 'primary', className, ...props }) {
  const baseStyle = "px-4 py-2 rounded-md font-medium transition-colors duration-200";
  const variants = {
    primary: "bg-accent hover:bg-indigo-600 text-white",
    secondary: "bg-secondary hover:bg-purple-600 text-white",
    ghost: "bg-transparent hover:bg-gray-800 text-gray-300",
    danger: "bg-red-500 hover:bg-red-600 text-white"
  };
  return <button className={clsx(baseStyle, variants[variant], className)} {...props}>{children}</button>;
}
