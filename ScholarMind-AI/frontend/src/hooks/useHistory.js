import { useState, useEffect } from 'react';
import historyService from '../services/historyService';
export const useHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { historyService.list().then(setHistory).catch(()=>{}).finally(() => setLoading(false)); }, []);
  return { history, loading, setHistory };
};
