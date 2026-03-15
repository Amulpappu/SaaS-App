import React from 'react';

const Card = ({ title, value, icon: Icon, trend, trendLabel }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-500 text-sm font-medium tracking-wide">{title}</h3>
        {Icon && (
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Icon size={20} />
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-slate-800 mb-2">{value}</div>
      {trend && (
        <div className="flex items-center text-sm">
          <span className={`font-medium ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
          <span className="text-slate-400 ml-2">{trendLabel}</span>
        </div>
      )}
    </div>
  );
};

export default Card;
