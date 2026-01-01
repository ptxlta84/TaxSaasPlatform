import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import '../../styles/design-tokens.css';

const TaxSummaryChart = ({ data }) => {
  // Default data if none provided (for verification/preview)
  const chartData = data || [
    {
      name: 'Q1',
      income: 4000,
      tax: 240,
    },
    {
      name: 'Q2',
      income: 3000,
      tax: 139,
    },
    {
      name: 'Q3',
      income: 2000,
      tax: 980,
    },
    {
      name: 'Q4',
      income: 2780,
      tax: 390,
    },
  ];

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-200)" />
          <XAxis dataKey="name" stroke="var(--color-gray-700)" />
          <YAxis stroke="var(--color-gray-700)" />
          <Tooltip 
            contentStyle={{ 
                backgroundColor: 'var(--color-gray-50)', 
                borderColor: 'var(--color-gray-200)',
                color: 'var(--color-gray-900)'
            }} 
          />
          <Legend wrapperStyle={{ color: 'var(--color-gray-700)' }}/>
          <Bar dataKey="income" name="Income" fill="var(--color-primary-500)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="tax" name="Tax Payable" fill="var(--color-error-500)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TaxSummaryChart;
