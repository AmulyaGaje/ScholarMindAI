import { useState, useEffect, useCallback } from 'react';
import projectService from '../services/projectService';
import toast from 'react-hot-toast';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectService.list();
      setProjects(data);
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Failed to load projects.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, loading, error, refresh: fetchProjects };
};
