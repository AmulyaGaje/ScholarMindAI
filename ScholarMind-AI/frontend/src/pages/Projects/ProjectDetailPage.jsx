import React from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '../../components/Layout/PageHeader';
export default function ProjectDetailPage() {
  const { id } = useParams();
  return (
    <div>
      <div className="mb-4 text-sm text-gray-400"><Link to="/projects" className="hover:text-white">Projects</Link> &gt; Project {id}</div>
      <PageHeader title={`Project ${id}`} />
      <div className="bg-card p-6 rounded-lg border border-[#2a3347] min-h-[400px]">
        <p className="text-gray-500">Project details and papers will appear here.</p>
      </div>
    </div>
  );
}
