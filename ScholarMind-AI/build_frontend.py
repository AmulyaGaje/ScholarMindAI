import os

files = {
  r"d:\ScholarMind-AI\frontend\package.json": r"""{
  "name": "scholarmind-ai", "version": "1.0.0", "type": "module",
  "scripts": { "dev": "vite", "build": "vite build" },
  "dependencies": {
    "react": "^18.2.0", "react-dom": "^18.2.0", "react-router-dom": "^6.22.0",
    "axios": "^1.6.0", "lucide-react": "^0.323.0", "react-dropzone": "^14.2.3",
    "react-hot-toast": "^2.4.1", "date-fns": "^3.3.1", "clsx": "^2.1.0",
    "framer-motion": "^11.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1", "tailwindcss": "^3.4.1", "postcss": "^8.4.35",
    "autoprefixer": "^10.4.17", "vite": "^5.1.0"
  }
}""",
  r"d:\ScholarMind-AI\frontend\vite.config.js": r"""import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()] });
""",
  r"d:\ScholarMind-AI\frontend\tailwind.config.js": r"""/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: { bgMain: '#0f1117', sidebar: '#161b27', card: '#1e2433', accent: '#6366f1', secondary: '#8b5cf6' },
      fontFamily: { sans: ['Inter', 'sans-serif'] }
    }
  },
  plugins: [],
}""",
  r"d:\ScholarMind-AI\frontend\postcss.config.js": r"""export default { plugins: { tailwindcss: {}, autoprefixer: {} } };""",
  r"d:\ScholarMind-AI\frontend\index.html": r"""<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ScholarMind AI</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body class="bg-bgMain text-white font-sans">
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>""",
  r"d:\ScholarMind-AI\frontend\Dockerfile": r"""FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]""",
  r"d:\ScholarMind-AI\frontend\.env.example": r"""VITE_API_BASE_URL=http://localhost:8000/api/v1""",
  r"d:\ScholarMind-AI\frontend\src\main.jsx": r"""import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
);""",
  r"d:\ScholarMind-AI\frontend\src\App.jsx": r"""import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router/index.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <AppRouter />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}""",
  r"d:\ScholarMind-AI\frontend\src\index.css": r"""@tailwind base;
@tailwind components;
@tailwind utilities;
:root { --bg-color: #ffffff; --text-color: #0f1117; }
.dark { --bg-color: #0f1117; --text-color: #ffffff; }
body { background-color: var(--bg-color); color: var(--text-color); }
""",
  r"d:\ScholarMind-AI\frontend\src\context\AuthContext.jsx": r"""import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';
export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (e) {
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    setIsAuthenticated(true);
  };
  
  const register = async (userData) => {
    await authService.register(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};""",
  r"d:\ScholarMind-AI\frontend\src\context\ThemeContext.jsx": r"""import React, { createContext, useState, useEffect } from 'react';
export const ThemeContext = createContext();
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};""",
  r"d:\ScholarMind-AI\frontend\src\services\api.js": r"""import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1' });
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(res => res, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return Promise.reject(err);
});
export default api;""",
  r"d:\ScholarMind-AI\frontend\src\services\authService.js": r"""import api from './api';
export default {
  login: async (email, password) => (await api.post('/auth/login', { email, password })).data,
  register: async (data) => (await api.post('/auth/register', data)).data,
  getMe: async () => (await api.get('/auth/me')).data,
};""",
  r"d:\ScholarMind-AI\frontend\src\services\paperService.js": r"""import api from './api';
export default {
  list: async () => (await api.get('/papers')).data,
  upload: async (formData) => (await api.post('/papers', formData, { headers: { 'Content-Type': 'multipart/form-data' }})).data,
  delete: async (id) => (await api.delete(`/papers/${id}`)).data,
};""",
  r"d:\ScholarMind-AI\frontend\src\services\projectService.js": r"""import api from './api';
export default {
  list: async () => (await api.get('/projects')).data,
  create: async (data) => (await api.post('/projects', data)).data,
  get: async (id) => (await api.get(`/projects/${id}`)).data,
  delete: async (id) => (await api.delete(`/projects/${id}`)).data,
};""",
  r"d:\ScholarMind-AI\frontend\src\services\historyService.js": r"""import api from './api';
export default {
  list: async () => (await api.get('/history')).data,
  clearAll: async () => (await api.delete('/history')).data,
};""",
  r"d:\ScholarMind-AI\frontend\src\services\searchService.js": r"""import api from './api';
export default {
  search: async (query, type) => (await api.get('/search', { params: { query, type } })).data,
};""",
  r"d:\ScholarMind-AI\frontend\src\services\statsService.js": r"""import api from './api';
export default { getStats: async () => (await api.get('/stats')).data };""",
  r"d:\ScholarMind-AI\frontend\src\services\bookmarkService.js": r"""import api from './api';
export default { toggle: async (id) => (await api.post(`/bookmarks/${id}`)).data };""",
  r"d:\ScholarMind-AI\frontend\src\hooks\useAuth.js": r"""import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
export const useAuth = () => useContext(AuthContext);""",
  r"d:\ScholarMind-AI\frontend\src\hooks\usePapers.js": r"""import { useState, useEffect } from 'react';
import paperService from '../services/paperService';
export const usePapers = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { paperService.list().then(setPapers).catch(()=>{}).finally(() => setLoading(false)); }, []);
  return { papers, loading, setPapers };
};""",
  r"d:\ScholarMind-AI\frontend\src\hooks\useProjects.js": r"""import { useState, useEffect } from 'react';
import projectService from '../services/projectService';
export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { projectService.list().then(setProjects).catch(()=>{}).finally(() => setLoading(false)); }, []);
  return { projects, loading };
};""",
  r"d:\ScholarMind-AI\frontend\src\hooks\useHistory.js": r"""import { useState, useEffect } from 'react';
import historyService from '../services/historyService';
export const useHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { historyService.list().then(setHistory).catch(()=>{}).finally(() => setLoading(false)); }, []);
  return { history, loading, setHistory };
};""",
  r"d:\ScholarMind-AI\frontend\src\hooks\useSearch.js": r"""import { useState } from 'react';
import searchService from '../services/searchService';
export const useSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const search = async (q, t) => { setLoading(true); try { setResults(await searchService.search(q, t)); } catch(e){} finally { setLoading(false); } };
  return { results, loading, search };
};""",
  r"d:\ScholarMind-AI\frontend\src\hooks\useDebounce.js": r"""import { useState, useEffect } from 'react';
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};""",
  r"d:\ScholarMind-AI\frontend\src\hooks\useLocalStorage.js": r"""import { useState } from 'react';
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try { const item = window.localStorage.getItem(key); return item ? JSON.parse(item) : initialValue; }
    catch (error) { return initialValue; }
  });
  const setValue = value => {
    try { setStoredValue(value); window.localStorage.setItem(key, JSON.stringify(value)); } catch (error) {}
  };
  return [storedValue, setValue];
};""",
  r"d:\ScholarMind-AI\frontend\src\router\index.jsx": r"""import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../components/Layout/MainLayout';
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';
import ForgotPasswordPage from '../pages/Auth/ForgotPasswordPage';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import LibraryPage from '../pages/Library/LibraryPage';
import ProjectsPage from '../pages/Projects/ProjectsPage';
import ProjectDetailPage from '../pages/Projects/ProjectDetailPage';
import HistoryPage from '../pages/History/HistoryPage';
import SearchPage from '../pages/Search/SearchPage';
import NotFoundPage from '../pages/NotFoundPage';
import { useAuth } from '../hooks/useAuth';

export default function AppRouter() {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/search" element={<SearchPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}""",
  r"d:\ScholarMind-AI\frontend\src\router\ProtectedRoute.jsx": r"""import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/UI/Spinner';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="h-screen flex items-center justify-center"><Spinner /></div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
}""",
  r"d:\ScholarMind-AI\frontend\src\components\UI\Button.jsx": r"""import React from 'react';
import clsx from 'clsx';
export default function Button({ children, variant = 'primary', className, ...props }) {
  const baseStyle = "px-4 py-2 rounded-md font-medium transition-colors duration-200";
  const variants = {
    primary: "bg-accent hover:bg-indigo-600 text-white",
    secondary: "bg-secondary hover:bg-purple-600 text-white",
    ghost: "bg-transparent hover:bg-gray-800 text-gray-300",
    danger: "bg-red-500 hover:bg-red-600 text-white"
  };
  return <button className={clsx(baseStyle, variants[variant], className)} {...props}>{children}</button>;
}""",
  r"d:\ScholarMind-AI\frontend\src\components\UI\Input.jsx": r"""import React from 'react';
import clsx from 'clsx';
export default function Input({ label, error, className, ...props }) {
  return (
    <div className={clsx("flex flex-col gap-1", className)}>
      {label && <label className="text-sm text-gray-300">{label}</label>}
      <input className="bg-card border border-gray-700 rounded-md px-3 py-2 text-white focus:border-accent focus:outline-none" {...props} />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}""",
  r"d:\ScholarMind-AI\frontend\src\components\UI\Modal.jsx": r"""import React from 'react';
export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded-lg max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white">&times;</button>
        {children}
      </div>
    </div>
  );
}""",
  r"d:\ScholarMind-AI\frontend\src\components\UI\Badge.jsx": r"""import React from 'react';
import clsx from 'clsx';
export default function Badge({ children, color = 'gray', className }) {
  const colors = {
    indigo: "bg-indigo-900 text-indigo-200",
    purple: "bg-purple-900 text-purple-200",
    emerald: "bg-emerald-900 text-emerald-200",
    amber: "bg-amber-900 text-amber-200",
    gray: "bg-gray-800 text-gray-300"
  };
  return <span className={clsx("px-2 py-1 text-xs rounded-full", colors[color], className)}>{children}</span>;
}""",
  r"d:\ScholarMind-AI\frontend\src\components\UI\Spinner.jsx": r"""import React from 'react';
export default function Spinner() {
  return <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>;
}""",
  r"d:\ScholarMind-AI\frontend\src\components\UI\EmptyState.jsx": r"""import React from 'react';
export default function EmptyState({ title, description, icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-card rounded-lg border border-gray-800">
      {Icon && <Icon className="w-12 h-12 text-gray-500 mb-4" />}
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}""",
  r"d:\ScholarMind-AI\frontend\src\components\UI\ConfirmDialog.jsx": r"""import React from 'react';
import Modal from './Modal';
import Button from './Button';
export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <p className="mb-6 text-gray-300">{message}</p>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm}>Confirm</Button>
      </div>
    </Modal>
  );
}""",
  r"d:\ScholarMind-AI\frontend\src\components\UI\Tooltip.jsx": r"""import React from 'react';
export default function Tooltip({ children, content }) {
  return (
    <div className="relative group inline-block">
      {children}
      <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
        {content}
      </div>
    </div>
  );
}""",
  r"d:\ScholarMind-AI\frontend\src\components\Layout\MainLayout.jsx": r"""import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
export default function MainLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-bgMain text-white">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6"><Outlet /></main>
      </div>
    </div>
  );
}""",
  r"d:\ScholarMind-AI\frontend\src\components\Layout\Sidebar.jsx": r"""import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Search, Book, Folder, Sparkles, Clock, Bookmark, Upload, Settings, User, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import clsx from 'clsx';
export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { logout, user } = useAuth();
  const navItems = [
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/library', icon: Book, label: 'My Library' },
    { to: '/projects', icon: Folder, label: 'Projects' },
    { to: '#', icon: Sparkles, label: 'AI Assistant', disabled: true },
    { to: '/history', icon: Clock, label: 'History' },
    { to: '/library?tab=bookmarks', icon: Bookmark, label: 'Bookmarks' },
    { to: '/library?tab=recent', icon: Upload, label: 'Recent Uploads' },
  ];
  return (
    <aside className={clsx("bg-sidebar flex flex-col transition-all duration-300 border-r border-[#2a3347]", collapsed ? "w-16" : "w-64")}>
      <div className="p-4 flex items-center justify-between">
        {!collapsed && <span className="font-bold text-lg tracking-tight">ScholarMind AI</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 hover:bg-gray-800 rounded"><Menu size={20}/></button>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        {navItems.map((item, i) => (
          item.disabled ? 
          <div key={i} className="flex items-center px-4 py-3 text-gray-500 cursor-not-allowed">
            <item.icon size={20} />
            {!collapsed && <span className="ml-3 flex-1">{item.label}</span>}
            {!collapsed && <span className="text-[10px] bg-gray-800 px-2 py-0.5 rounded-full">Soon</span>}
          </div> :
          <NavLink key={i} to={item.to} className={({isActive}) => clsx("flex items-center px-4 py-3 hover:bg-gray-800 transition-colors", isActive && "bg-gray-800 border-r-2 border-accent text-accent")}>
            <item.icon size={20} />
            {!collapsed && <span className="ml-3">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-[#2a3347] p-2">
        <div className="flex items-center px-2 py-2 hover:bg-gray-800 rounded cursor-pointer"><Settings size={20}/>{!collapsed && <span className="ml-3">Settings</span>}</div>
        <div className="flex items-center px-2 py-2 hover:bg-gray-800 rounded cursor-pointer"><User size={20}/>{!collapsed && <span className="ml-3">{user?.username || 'Profile'}</span>}</div>
        <div onClick={logout} className="flex items-center px-2 py-2 hover:bg-gray-800 rounded cursor-pointer text-red-400"><LogOut size={20}/>{!collapsed && <span className="ml-3">Logout</span>}</div>
      </div>
    </aside>
  );
}""",
  r"d:\ScholarMind-AI\frontend\src\components\Layout\Navbar.jsx": r"""import React, { useContext } from 'react';
import { Bell, Search, Sun, Moon } from 'lucide-react';
import { ThemeContext } from '../../context/ThemeContext';
export default function Navbar() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <header className="h-16 bg-bgMain border-b border-[#2a3347] flex items-center justify-between px-6">
      <div className="text-gray-400 text-sm">Dashboard</div>
      <div className="flex items-center gap-4">
        <Search size={20} className="text-gray-400 cursor-pointer hover:text-white" />
        <button onClick={toggleTheme} className="text-gray-400 hover:text-white">
          {theme === 'dark' ? <Sun size={20}/> : <Moon size={20}/>}
        </button>
        <Bell size={20} className="text-gray-400 cursor-pointer hover:text-white" />
        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm cursor-pointer">U</div>
      </div>
    </header>
  );
}""",
  r"d:\ScholarMind-AI\frontend\src\components\Layout\PageHeader.jsx": r"""import React from 'react';
export default function PageHeader({ title, children }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}""",
  r"d:\ScholarMind-AI\frontend\src\components\Papers\PaperCard.jsx": r"""import React from 'react';
import { FileText, MoreVertical } from 'lucide-react';
export default function PaperCard({ paper }) {
  return (
    <div className="bg-card p-4 rounded-lg border border-[#2a3347] hover:border-accent transition-colors">
      <div className="h-32 bg-gray-800 rounded-md mb-4 flex items-center justify-center">
        <FileText size={40} className="text-gray-600" />
      </div>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-sm line-clamp-2">{paper?.title || 'Untitled Paper'}</h3>
          <p className="text-xs text-gray-400 mt-1">{paper?.authors || 'Unknown Authors'}</p>
        </div>
        <button className="text-gray-400 hover:text-white"><MoreVertical size={16}/></button>
      </div>
    </div>
  );
}""",
  r"d:\ScholarMind-AI\frontend\src\components\Papers\PaperListItem.jsx": r"""import React from 'react';
import { FileText, MoreVertical } from 'lucide-react';
export default function PaperListItem({ paper }) {
  return (
    <div className="flex items-center justify-between bg-card p-3 rounded-lg border border-[#2a3347] hover:border-accent transition-colors mb-2">
      <div className="flex items-center gap-4">
        <FileText size={24} className="text-indigo-400" />
        <div>
          <h3 className="font-semibold text-sm">{paper?.title || 'Untitled Paper'}</h3>
          <p className="text-xs text-gray-400">{paper?.authors || 'Unknown Authors'}</p>
        </div>
      </div>
      <button className="text-gray-400 hover:text-white"><MoreVertical size={16}/></button>
    </div>
  );
}""",
  r"d:\ScholarMind-AI\frontend\src\components\Papers\UploadModal.jsx": r"""import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Modal from '../UI/Modal';
import { UploadCloud } from 'lucide-react';
export default function UploadModal({ isOpen, onClose }) {
  const onDrop = useCallback(acceptedFiles => {
    onClose();
  }, [onClose]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">Upload Paper</h2>
      <div {...getRootProps()} className={`border-2 border-dashed p-10 text-center rounded-lg cursor-pointer ${isDragActive ? 'border-accent bg-indigo-900/20' : 'border-gray-600'}`}>
        <input {...getInputProps()} />
        <UploadCloud size={40} className="mx-auto text-gray-400 mb-4" />
        {isDragActive ? <p>Drop the files here ...</p> : <p>Drag 'n' drop files here, or click to select files</p>}
      </div>
    </Modal>
  );
}""",
  r"d:\ScholarMind-AI\frontend\src\components\Papers\PaperActions.jsx": r"""import React from 'react';
import { Download, Trash2, Edit } from 'lucide-react';
export default function PaperActions() {
  return (
    <div className="flex gap-2">
      <button className="p-2 hover:bg-gray-700 rounded"><Edit size={16}/></button>
      <button className="p-2 hover:bg-gray-700 rounded"><Download size={16}/></button>
      <button className="p-2 hover:bg-red-900 text-red-400 rounded"><Trash2 size={16}/></button>
    </div>
  );
}""",
  r"d:\ScholarMind-AI\frontend\src\components\Projects\ProjectCard.jsx": r"""import React from 'react';
import { Folder } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
export default function ProjectCard({ project }) {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate(`/projects/${project?.id || 1}`)} className="bg-card p-5 rounded-lg border border-[#2a3347] hover:border-purple-500 cursor-pointer transition-all">
      <div className="flex items-center gap-3 mb-3">
        <Folder size={24} className="text-purple-400" />
        <h3 className="font-semibold text-lg">{project?.name || 'New Project'}</h3>
      </div>
      <p className="text-sm text-gray-400 mb-4 line-clamp-2">{project?.description || 'No description provided.'}</p>
      <div className="text-xs text-gray-500">{project?.paperCount || 0} papers &middot; Updated recently</div>
    </div>
  );
}""",
  r"d:\ScholarMind-AI\frontend\src\components\Projects\CreateProjectModal.jsx": r"""import React, { useState } from 'react';
import Modal from '../UI/Modal';
import Input from '../UI/Input';
import Button from '../UI/Button';
export default function CreateProjectModal({ isOpen, onClose }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const handleSubmit = (e) => { e.preventDefault(); onClose(); };
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">Create Project</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Project Name" value={name} onChange={e=>setName(e.target.value)} required />
        <Input label="Description" value={desc} onChange={e=>setDesc(e.target.value)} />
        <Button type="submit" className="mt-2">Create</Button>
      </form>
    </Modal>
  );
}""",
  r"d:\ScholarMind-AI\frontend\src\components\Dashboard\StatsCard.jsx": r"""import React from 'react';
export default function StatsCard({ title, value, icon: Icon, colorClass }) {
  return (
    <div className="bg-card p-5 rounded-lg border border-[#2a3347] flex items-center gap-4">
      <div className={`p-3 rounded-lg bg-opacity-20 ${colorClass.replace('text-', 'bg-')}`}>
        <Icon className={colorClass} size={24} />
      </div>
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}""",
  r"d:\ScholarMind-AI\frontend\src\components\Dashboard\RecentActivity.jsx": r"""import React from 'react';
export default function RecentActivity({ activities = [] }) {
  return (
    <div className="bg-card p-5 rounded-lg border border-[#2a3347]">
      <h3 className="font-bold mb-4">Recent Activity</h3>
      {activities.length === 0 ? <p className="text-sm text-gray-500">No recent activity.</p> :
        <ul className="space-y-3">
          {activities.map((act, i) => (
            <li key={i} className="text-sm flex gap-2"><span className="text-gray-400">{act.time}:</span> <span>{act.text}</span></li>
          ))}
        </ul>
      }
    </div>
  );
}""",
  r"d:\ScholarMind-AI\frontend\src\components\Dashboard\WelcomeBanner.jsx": r"""import React from 'react';
export default function WelcomeBanner({ name }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 rounded-xl border border-indigo-500/20">
      <h1 className="text-3xl font-bold mb-2">{greeting}, {name}!</h1>
      <p className="text-gray-300">Welcome back to ScholarMind AI. Ready to continue your research?</p>
    </div>
  );
}""",
  r"d:\ScholarMind-AI\frontend\src\components\Dashboard\QuickActions.jsx": r"""import React from 'react';
import Button from '../UI/Button';
import { Upload, FolderPlus } from 'lucide-react';
export default function QuickActions({ onUpload, onCreateProject }) {
  return (
    <div className="flex gap-4 mb-8">
      <Button onClick={onUpload} className="flex items-center gap-2"><Upload size={18}/> Upload Paper</Button>
      <Button onClick={onCreateProject} variant="secondary" className="flex items-center gap-2"><FolderPlus size={18}/> Create Project</Button>
    </div>
  );
}""",
  r"d:\ScholarMind-AI\frontend\src\components\Search\SearchBar.jsx": r"""import React from 'react';
import { Search } from 'lucide-react';
export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
      <input type="text" value={value} onChange={onChange} placeholder="Search papers, projects, or history..." 
        className="w-full bg-card border border-gray-700 rounded-full py-3 pl-12 pr-4 text-white focus:border-accent focus:outline-none shadow-lg" />
    </div>
  );
}""",
  r"d:\ScholarMind-AI\frontend\src\components\Search\SearchResults.jsx": r"""import React from 'react';
import PaperListItem from '../Papers/PaperListItem';
export default function SearchResults({ results }) {
  if (!results.length) return <div className="text-center text-gray-500 mt-8">No results found.</div>;
  return <div className="mt-8 space-y-2 max-w-2xl mx-auto">{results.map((r, i) => <PaperListItem key={i} paper={r} />)}</div>;
}""",
  r"d:\ScholarMind-AI\frontend\src\components\Search\SearchFilters.jsx": r"""import React from 'react';
export default function SearchFilters({ activeFilter, setFilter }) {
  const filters = ['All', 'Papers', 'Projects', 'History'];
  return (
    <div className="flex justify-center gap-2 mt-4">
      {filters.map(f => (
        <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1 rounded-full text-sm ${activeFilter === f ? 'bg-accent text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
          {f}
        </button>
      ))}
    </div>
  );
}""",
  r"d:\ScholarMind-AI\frontend\src\components\History\HistoryGroup.jsx": r"""import React from 'react';
export default function HistoryGroup({ title, children }) {
  return (
    <div className="mb-6">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">{title}</h4>
      <div className="space-y-1">{children}</div>
    </div>
  );
}""",
  r"d:\ScholarMind-AI\frontend\src\components\History\HistoryItem.jsx": r"""import React from 'react';
import { MessageSquare } from 'lucide-react';
export default function HistoryItem({ item }) {
  return (
    <div className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-md cursor-pointer group">
      <MessageSquare size={16} className="text-gray-400 group-hover:text-white" />
      <span className="text-sm text-gray-300 group-hover:text-white flex-1 truncate">{item.title}</span>
    </div>
  );
}""",
  r"d:\ScholarMind-AI\frontend\src\pages\Auth\LoginPage.jsx": r"""import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      toast.error('Login failed. Please check credentials.');
    }
  };

  return (
    <div className="flex h-screen bg-bgMain">
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-900 to-bgMain items-center justify-center p-12">
        <div>
          <h1 className="text-5xl font-bold text-white mb-4">ScholarMind AI</h1>
          <p className="text-xl text-indigo-200">Accelerate your research with AI.</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-card p-8 rounded-xl border border-[#2a3347]">
          <h2 className="text-2xl font-bold mb-6 text-center">Welcome Back</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
            <Input label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" /> Remember me</label>
              <Link to="/forgot-password" className="text-accent hover:underline">Forgot password?</Link>
            </div>
            <Button type="submit" className="w-full mt-2">Sign In</Button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-400">
            Don't have an account? <Link to="/register" className="text-accent hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}""",
  r"d:\ScholarMind-AI\frontend\src\pages\Auth\RegisterPage.jsx": r"""import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ full_name: '', username: '', email: '', password: '', confirm: '' });
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(formData.password !== formData.confirm) return toast.error('Passwords do not match');
    try {
      await register(formData);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) { toast.error('Registration failed'); }
  };

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  return (
    <div className="flex h-screen bg-bgMain">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-card p-8 rounded-xl border border-[#2a3347]">
          <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input label="Full Name" name="full_name" onChange={handleChange} required />
            <Input label="Username" name="username" onChange={handleChange} required />
            <Input label="Email" type="email" name="email" onChange={handleChange} required />
            <Input label="Password" type="password" name="password" onChange={handleChange} required />
            <Input label="Confirm Password" type="password" name="confirm" onChange={handleChange} required />
            <Button type="submit" className="w-full mt-4">Sign Up</Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-400">
            Already have an account? <Link to="/login" className="text-accent hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}""",
  r"d:\ScholarMind-AI\frontend\src\pages\Auth\ForgotPasswordPage.jsx": r"""import React from 'react';
import { Link } from 'react-router-dom';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
export default function ForgotPasswordPage() {
  return (
    <div className="flex h-screen bg-bgMain items-center justify-center p-8">
      <div className="w-full max-w-md bg-card p-8 rounded-xl border border-[#2a3347]">
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>
        <p className="text-sm text-gray-400 mb-6 text-center">Enter your email and we'll send a link to reset your password.</p>
        <form className="flex flex-col gap-4">
          <Input label="Email" type="email" required />
          <Button type="submit" className="w-full">Send Reset Link</Button>
        </form>
        <p className="mt-4 text-center text-sm"><Link to="/login" className="text-accent hover:underline">Back to login</Link></p>
      </div>
    </div>
  );
}""",
  r"d:\ScholarMind-AI\frontend\src\pages\Dashboard\DashboardPage.jsx": r"""import React, { useState } from 'react';
import { FileText, Folder, Upload, HardDrive } from 'lucide-react';
import WelcomeBanner from '../../components/Dashboard/WelcomeBanner';
import StatsCard from '../../components/Dashboard/StatsCard';
import QuickActions from '../../components/Dashboard/QuickActions';
import RecentActivity from '../../components/Dashboard/RecentActivity';
import UploadModal from '../../components/Papers/UploadModal';
import CreateProjectModal from '../../components/Projects/CreateProjectModal';
import { useAuth } from '../../hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [isProjectOpen, setProjectOpen] = useState(false);

  return (
    <div>
      <WelcomeBanner name={user?.full_name || user?.username || 'Researcher'} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Papers" value="42" icon={FileText} colorClass="text-indigo-500" />
        <StatsCard title="Active Projects" value="7" icon={Folder} colorClass="text-purple-500" />
        <StatsCard title="Recent Uploads" value="12" icon={Upload} colorClass="text-emerald-500" />
        <StatsCard title="Storage Used" value="1.2 GB" icon={HardDrive} colorClass="text-amber-500" />
      </div>
      <QuickActions onUpload={() => setUploadOpen(true)} onCreateProject={() => setProjectOpen(true)} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-card p-6 rounded-lg border border-[#2a3347] min-h-[300px] flex items-center justify-center">
            <p className="text-gray-500">Recent papers and projects will appear here.</p>
          </div>
        </div>
        <div>
          <RecentActivity activities={[{time: '2h ago', text: 'Uploaded Attention is All You Need'}, {time: '1d ago', text: 'Created Project NLP'}]} />
        </div>
      </div>
      <UploadModal isOpen={isUploadOpen} onClose={() => setUploadOpen(false)} />
      <CreateProjectModal isOpen={isProjectOpen} onClose={() => setProjectOpen(false)} />
    </div>
  );
}""",
  r"d:\ScholarMind-AI\frontend\src\pages\Library\LibraryPage.jsx": r"""import React, { useState } from 'react';
import PageHeader from '../../components/Layout/PageHeader';
import Button from '../../components/UI/Button';
import PaperCard from '../../components/Papers/PaperCard';
import UploadModal from '../../components/Papers/UploadModal';
import { UploadCloud } from 'lucide-react';

export default function LibraryPage() {
  const [isUploadOpen, setUploadOpen] = useState(false);
  const mockPapers = [{id:1, title: 'Attention Is All You Need', authors: 'Vaswani et al.'}, {id:2, title: 'BERT: Pre-training of Deep Bidirectional Transformers', authors: 'Devlin et al.'}];
  
  return (
    <div>
      <PageHeader title="My Library">
        <Button onClick={() => setUploadOpen(true)} className="flex items-center gap-2"><UploadCloud size={16}/> Upload</Button>
      </PageHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mockPapers.map(p => <PaperCard key={p.id} paper={p} />)}
      </div>
      <UploadModal isOpen={isUploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  );
}""",
  r"d:\ScholarMind-AI\frontend\src\pages\Projects\ProjectsPage.jsx": r"""import React, { useState } from 'react';
import PageHeader from '../../components/Layout/PageHeader';
import Button from '../../components/UI/Button';
import ProjectCard from '../../components/Projects/ProjectCard';
import CreateProjectModal from '../../components/Projects/CreateProjectModal';

export default function ProjectsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const mockProjects = [{id:1, name: 'NLP Research', description: 'Papers on transformers and LLMs', paperCount: 15}, {id:2, name: 'Computer Vision', description: 'CNNs, ViTs, and generative models', paperCount: 8}];

  return (
    <div>
      <PageHeader title="Projects">
        <Button onClick={() => setIsOpen(true)}>Create Project</Button>
      </PageHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProjects.map(p => <ProjectCard key={p.id} project={p} />)}
      </div>
      <CreateProjectModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}""",
  r"d:\ScholarMind-AI\frontend\src\pages\Projects\ProjectDetailPage.jsx": r"""import React from 'react';
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
}""",
  r"d:\ScholarMind-AI\frontend\src\pages\History\HistoryPage.jsx": r"""import React from 'react';
import PageHeader from '../../components/Layout/PageHeader';
import HistoryGroup from '../../components/History/HistoryGroup';
import HistoryItem from '../../components/History/HistoryItem';
export default function HistoryPage() {
  return (
    <div className="flex h-full gap-6">
      <div className="w-80 border-r border-[#2a3347] pr-6 flex flex-col">
        <PageHeader title="History" />
        <div className="flex-1 overflow-y-auto">
          <HistoryGroup title="Today">
            <HistoryItem item={{title: 'Analysis of Attention Is All You Need'}} />
            <HistoryItem item={{title: 'Summary of BERT paper'}} />
          </HistoryGroup>
          <HistoryGroup title="Yesterday">
            <HistoryItem item={{title: 'Project NLP discussion'}} />
          </HistoryGroup>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a chat to view history
      </div>
    </div>
  );
}""",
  r"d:\ScholarMind-AI\frontend\src\pages\Search\SearchPage.jsx": r"""import React, { useState } from 'react';
import SearchBar from '../../components/Search/SearchBar';
import SearchFilters from '../../components/Search/SearchFilters';
import SearchResults from '../../components/Search/SearchResults';
export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  return (
    <div className="pt-12">
      <h1 className="text-3xl font-bold text-center mb-8">Search ScholarMind</h1>
      <SearchBar value={query} onChange={e => setQuery(e.target.value)} />
      <SearchFilters activeFilter={filter} setFilter={setFilter} />
      {query && <SearchResults results={[{title: `Result for ${query}`}]} />}
    </div>
  );
}""",
  r"d:\ScholarMind-AI\frontend\src\pages\NotFoundPage.jsx": r"""import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/UI/Button';
export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-bgMain">
      <h1 className="text-6xl font-bold mb-4 text-accent">404</h1>
      <p className="text-xl mb-8">Page not found</p>
      <Link to="/"><Button>Return Home</Button></Link>
    </div>
  );
}""",
  r"d:\ScholarMind-AI\frontend\src\utils\formatters.js": r"""import { format } from 'date-fns';
export const formatDate = (date) => date ? format(new Date(date), 'MMM d, yyyy') : '';
export const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024, dm = decimals < 0 ? 0 : decimals, sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'], i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};""",
  r"d:\ScholarMind-AI\frontend\src\utils\validators.js": r"""export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const isStrongPassword = (pw) => pw.length >= 8;""",
  r"d:\ScholarMind-AI\frontend\src\utils\constants.js": r"""export const APP_NAME = 'ScholarMind AI';
export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';"""
}

for filepath, content in files.items():
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')

print("All React files created successfully!")
