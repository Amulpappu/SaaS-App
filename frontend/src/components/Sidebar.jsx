import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BarChart2, Users, CreditCard, Settings, ShieldAlert } from 'lucide-react';

const Sidebar = ({ isAdmin }) => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Teams', path: '/teams', icon: Users },
    { name: 'Billing', path: '/billing', icon: CreditCard },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  if (isAdmin) {
    navItems.push({ name: 'Admin', path: '/admin', icon: ShieldAlert });
  }

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 min-h-screen p-4 flex flex-col">
      <div className="mb-8 px-4 flex items-center h-12">
        <h1 className="text-2xl font-bold text-white tracking-tight">SaaS Platform</h1>
      </div>
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
             <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
