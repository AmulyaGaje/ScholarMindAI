import { useState } from 'react';
import searchService from '../services/searchService';
export const useSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const search = async (q, t) => { setLoading(true); try { setResults(await searchService.search(q, t)); } catch(e){} finally { setLoading(false); } };
  return { results, loading, search };
};
