import React, { useEffect, useState } from 'react';
import { Activity, CreditCard, Users, Zap } from 'lucide-react';
import Card from '../components/Card';
import Chart from '../components/Chart';
import { analyticsAPI } from '../api';

const Dashboard = ({ user }) => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await analyticsAPI.getMetrics();
        setMetrics(res.data);
      } catch (e) {
        console.error("Failed to load metrics");
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto flex-1 h-full overflow-y-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Overview</h1>
        <p className="text-slate-500 mt-2">Welcome back, {user?.email}. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 transform transition-all">
        <Card 
          title="Active Subscriptions" 
          value={metrics ? metrics.active_subscriptions : "..."} 
          icon={CreditCard} 
          trend={12} 
          trendLabel="vs last month" 
        />
        <Card 
          title="Total Users" 
          value={metrics ? metrics.total_users : "..."} 
          icon={Users} 
          trend={4} 
          trendLabel="vs last month" 
        />
        <Card 
          title="Server Load" 
          value="42%" 
          icon={Activity} 
          trend={-2} 
          trendLabel="vs last hour" 
        />
        <Card 
          title="API Requests" 
          value="1.2M" 
          icon={Zap} 
          trend={8} 
          trendLabel="vs yesterday" 
        />
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm mt-8">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Activity Timeline</h2>
        <Chart data={metrics?.chart_data} dataKey={user?.is_admin ? "revenue" : "activity"} color="#4f46e5" />
      </div>
    </div>
  );
};

export default Dashboard;
