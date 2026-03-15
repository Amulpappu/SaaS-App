import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import Teams from './pages/Teams';
import Admin from './pages/Admin';
import Analytics from './pages/Analytics';
import api from './api';

const ProtectedRoute = ({ children, user, loading }) => {
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-pulse flex space-x-4"><div className="rounded-full bg-slate-200 h-12 w-12"></div></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="flex bg-slate-50 min-h-screen overflow-hidden">
      <Sidebar isAdmin={user?.is_admin} />
      <div className="flex flex-col flex-1 w-full relative">
        <Navbar user={user} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 w-full relative">
          {children}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
      } catch (err) {
        setUser(null);
        localStorage.removeItem('token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/register" element={<Register setToken={setToken} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        <Route path="/dashboard" element={<ProtectedRoute user={user} loading={loading}><Dashboard user={user} /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute user={user} loading={loading}><Billing user={user} /></ProtectedRoute>} />
        <Route path="/teams" element={<ProtectedRoute user={user} loading={loading}><Teams user={user} /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute user={user} loading={loading}><Analytics user={user} /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute user={user} loading={loading}><Admin user={user} /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
