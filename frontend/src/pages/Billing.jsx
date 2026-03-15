import React, { useEffect, useState } from 'react';
import { CreditCard, Check } from 'lucide-react';
import api from '../api';

const Billing = ({ user }) => {
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSub = async () => {
      try {
        const res = await api.get('/billing/my-subscription');
        setSub(res.data);
      } catch (err) { }
    };
    fetchSub();
  }, []);

  const handleCheckout = async (plan) => {
    setLoading(true);
    try {
      const res = await api.post('/billing/create-checkout-session', { plan });
      window.location.href = res.data.url;
    } catch (err) {
      alert("Billing testing requires Stripe keys configured on backend.");
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    { name: 'free', price: '$0', features: ['Core Features', 'Basic Analytics'] },
    { name: 'pro', price: '$29', features: ['All Core Features', 'Advanced Analytics', 'Priority Support'] },
    { name: 'enterprise', price: '$99', features: ['Custom Integrations', 'Dedicated Account Manager', 'SLA'] },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto h-full overflow-y-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Billing & Plans</h1>
        <p className="text-slate-500 mt-2">Manage your subscription and payment methods.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-10 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CreditCard className="text-indigo-600" size={20} /> Current Plan: <span className="capitalize">{sub?.plan || 'Free'}</span>
          </h2>
          <p className="text-slate-500 mt-1">Status: <span className="capitalize font-medium text-emerald-600">{sub?.status || 'Active'}</span></p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((p) => (
          <div key={p.name} className={`bg-white rounded-2xl p-8 border ${sub?.plan === p.name ? 'border-indigo-600 ring-1 ring-indigo-600 shadow-md' : 'border-slate-200 shadow-sm'} relative flex flex-col`}>
             {sub?.plan === p.name && (
                <div className="absolute top-0 transform -translate-y-1/2 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide left-1/2 -translate-x-1/2">
                  Current Plan
                </div>
             )}
             <h3 className="text-xl font-bold text-slate-900 capitalize text-center mb-2">{p.name}</h3>
             <div className="text-center mb-6">
                <span className="text-4xl font-extrabold text-slate-900">{p.price}</span>
                <span className="text-slate-500">/mo</span>
             </div>
             <ul className="space-y-4 mb-8 flex-1">
               {p.features.map(f => (
                 <li key={f} className="flex items-center text-slate-700 text-sm">
                   <Check className="text-emerald-500 mr-3 shrink-0" size={18} /> {f}
                 </li>
               ))}
             </ul>
             <button
               onClick={() => handleCheckout(p.name)}
               disabled={loading || sub?.plan === p.name}
               className={`w-full py-3 px-4 rounded-xl font-bold transition-all ${
                 sub?.plan === p.name 
                 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                 : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow active:scale-[0.98]'
               }`}
             >
               {sub?.plan === p.name ? 'Active' : 'Upgrade'}
             </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Billing;
