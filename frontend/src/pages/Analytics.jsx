import React, { useEffect, useState } from 'react';
import Chart from '../components/Chart';
import api from '../api';

const Analytics = ({ user }) => {
    const [metrics, setMetrics] = useState(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const res = await api.get('/analytics/metrics');
                setMetrics(res.data);
            } catch (err) {}
        };
        fetchMetrics();
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Analytics Center</h1>
                <p className="text-slate-500 mt-2">Deep dive into your application metrics and usage.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-6">Revenue Growth</h2>
                    <Chart data={metrics?.chart_data} dataKey="revenue" color="#10b981" />
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-6">Active Usage</h2>
                    <Chart data={metrics?.chart_data} dataKey="activity" color="#4f46e5" />
                </div>
            </div>
        </div>
    );
};

export default Analytics;
