import React from 'react';
import { Loader2 } from 'lucide-react';

const SIZE_MAP = {
  sm: 16,
  md: 24,
  lg: 36,
  xl: 48,
};

export default function Spinner({ size = 'md', className = '' }) {
  const px = SIZE_MAP[size] ?? 24;
  return (
    <Loader2
      size={px}
      className={`animate-spin text-accent ${className}`}
      aria-label="Loading..."
    />
  );
}
