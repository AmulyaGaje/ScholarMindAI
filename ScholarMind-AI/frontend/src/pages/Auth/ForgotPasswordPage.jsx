import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }
    toast.success('Password reset link sent to your email!');
  };

  return (
    <div className="flex h-screen bg-bgMain items-center justify-center p-8">
      <div className="w-full max-w-md bg-card p-8 rounded-xl border border-[#2a3347]">
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>
        <p className="text-sm text-gray-400 mb-6 text-center">Enter your email and we'll send a link to reset your password.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input 
            label="Email" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          <Button type="submit" className="w-full">Send Reset Link</Button>
        </form>
        <p className="mt-4 text-center text-sm"><Link to="/login" className="text-accent hover:underline">Back to login</Link></p>
      </div>
    </div>
  );
}
