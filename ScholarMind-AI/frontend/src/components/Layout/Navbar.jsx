import React, { useContext } from 'react';
import { Bell, Search, Sun, Moon } from 'lucide-react';
import { ThemeContext } from '../../context/ThemeContext';
export default function Navbar() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <header className="h-16 bg-bgMain border-b border-[#2a3347] flex items-center justify-between px-6">
      <div className="text-gray-400 text-sm">Dashboard</div>
      <div className="flex items-center gap-4">
        <Search size={20} className="text-gray-400 cursor-pointer hover:text-white" />
        <button onClick={toggleTheme} className="text-gray-400 hover:text-white">
          {theme === 'dark' ? <Sun size={20}/> : <Moon size={20}/>}
        </button>
        <Bell size={20} className="text-gray-400 cursor-pointer hover:text-white" />
        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm cursor-pointer">U</div>
      </div>
    </header>
  );
}
