import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const DeductionBarChart = ({ data }) => {
  if (!data || data.length === 0) return <div className="text-center text-gray-500 py-10">No Deduction Data</div>;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 h-[350px]">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Deduction Utilization</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis dataKey="section" axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip 
             cursor={{ fill: 'transparent' }}
             formatter={(value) => `₹ ${value.toLocaleString()}`}
             contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
          <Legend />
          <Bar dataKey="used" name="Claimed" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} />
          <Bar dataKey="max" name="Max Limit" fill="#E5E7EB" radius={[4, 4, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DeductionBarChart;
