import { useState, useEffect } from 'react';
import paperService from '../services/paperService';
export const usePapers = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { paperService.list().then(setPapers).catch(()=>{}).finally(() => setLoading(false)); }, []);
  return { papers, loading, setPapers };
};
