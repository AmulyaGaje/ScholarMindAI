import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/UI/Button';
export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-bgMain">
      <h1 className="text-6xl font-bold mb-4 text-accent">404</h1>
      <p className="text-xl mb-8">Page not found</p>
      <Link to="/"><Button>Return Home</Button></Link>
    </div>
  );
}
