'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface ChartData {
  name: string;
  Revenue: number;
  Expenses: number;
  Profit: number;
}

export function DashboardCharts({ data }: { data: ChartData[] }) {
  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} tickFormatter={(val) => `₹${val/1000}k`} dx={-10} />
          <Tooltip 
            cursor={{fill: 'transparent'}}
            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'}}
            formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, undefined]}
          />
          <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
          <Bar dataKey="Revenue" fill="#0D47A1" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
