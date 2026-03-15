import React, { useState, useEffect } from 'react';
import api from '../api';
import { ShieldAlert, UserX, CheckCircle2 } from 'lucide-react';

const Admin = ({ user }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (user?.is_admin) {
        fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch(err) { console.error(err) }
  };

  const toggleStatus = async (uid, isActive) => {
    try {
        if (isActive) await api.post(`/admin/users/${uid}/suspend`);
        else await api.post(`/admin/users/${uid}/activate`);
        fetchUsers();
    } catch(e) {}
  };

  if (!user?.is_admin) {
      return (
          <div className="p-8 flex items-center justify-center h-full">
              <div className="text-center">
                <ShieldAlert size={48} className="mx-auto text-rose-500 mb-4" />
                <h2 className="text-2xl font-bold text-slate-800">Access Denied</h2>
                <p className="text-slate-500 mt-2">You require administrator privileges to view this page.</p>
              </div>
          </div>
      )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto h-full overflow-y-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Console</h1>
        <p className="text-slate-500 mt-2">Manage platform users and view global metadata.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">ID</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">Email</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {users.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 text-sm text-slate-500">#{u.id}</td>
                            <td className="px-6 py-4 font-medium text-slate-900">{u.email}</td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                    {u.is_active ? 'Active' : 'Suspended'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button 
                                    onClick={() => toggleStatus(u.id, u.is_active)}
                                    className={`inline-flex items-center text-sm font-medium transition-colors ${u.is_active ? 'text-rose-600 hover:text-rose-800' : 'text-emerald-600 hover:text-emerald-800'}`}
                                >
                                    {u.is_active ? <><UserX size={16} className="mr-1" /> Suspend</> : <><CheckCircle2 size={16} className="mr-1" /> Activate</>}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
