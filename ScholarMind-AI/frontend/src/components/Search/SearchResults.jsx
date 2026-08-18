import React from 'react';
import PaperListItem from '../Papers/PaperListItem';
export default function SearchResults({ results }) {
  if (!results.length) return <div className="text-center text-gray-500 mt-8">No results found.</div>;
  return <div className="mt-8 space-y-2 max-w-2xl mx-auto">{results.map((r, i) => <PaperListItem key={i} paper={r} />)}</div>;
}
