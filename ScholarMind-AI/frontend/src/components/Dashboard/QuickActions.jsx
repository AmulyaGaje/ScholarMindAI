import React from 'react';
import Button from '../UI/Button';
import { Upload, FolderPlus } from 'lucide-react';
export default function QuickActions({ onUpload, onCreateProject }) {
  return (
    <div className="flex gap-4 mb-8">
      <Button onClick={onUpload} className="flex items-center gap-2"><Upload size={18}/> Upload Paper</Button>
      <Button onClick={onCreateProject} variant="secondary" className="flex items-center gap-2"><FolderPlus size={18}/> Create Project</Button>
    </div>
  );
}
