import React from 'react';
export default function WelcomeBanner({ name }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 rounded-xl border border-indigo-500/20">
      <h1 className="text-3xl font-bold mb-2">{greeting}, {name}!</h1>
      <p className="text-gray-300">Welcome back to ScholarMind AI. Ready to continue your research?</p>
    </div>
  );
}
