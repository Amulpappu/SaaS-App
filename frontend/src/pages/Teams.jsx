import React, { useState, useEffect } from 'react';
import api from '../api';
import { Users, UserPlus } from 'lucide-react';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [newTeamName, setNewTeamName] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await api.get('/teams/');
      setTeams(res.data);
    } catch(err) { console.error(err) }
  };

  const createTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName) return;
    try {
      await api.post('/teams/', { name: newTeamName });
      setNewTeamName('');
      fetchTeams();
    } catch(err) {}
  };

  return (
    <div className="p-8 max-w-5xl mx-auto h-full overflow-y-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Teams</h1>
        <p className="text-slate-500 mt-2">Manage your organizations and invite collaborators.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <UserPlus size={20} className="text-indigo-600" /> Create New Team
        </h2>
        <form onSubmit={createTeam} className="flex gap-4">
            <input 
                type="text" 
                value={newTeamName}
                onChange={e => setNewTeamName(e.target.value)}
                placeholder="Team Name" 
                className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">Create</button>
        </form>
      </div>

      <div className="grid gap-6">
        {teams.map(team => (
            <div key={team.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{team.name}</h3>
                    <p className="text-sm text-slate-500">Created {new Date(team.created_at).toLocaleDateString()}</p>
                </div>
                <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm bg-indigo-50 px-4 py-2 rounded-lg transition-colors">
                    Manage Members
                </button>
            </div>
        ))}
        {teams.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <Users size={40} className="mx-auto text-slate-400 mb-3" />
                <p className="text-slate-500">You are not part of any teams yet.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Teams;
