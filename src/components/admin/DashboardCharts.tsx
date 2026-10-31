'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface ChartData {
  name: string;
  Revenue: number;
  Expenses?: number;
  Profit?: number;
  Bookings?: number;
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
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 700}} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 600}} tickFormatter={(val) => `₹${val/1000}k`} dx={-10} />
          <Tooltip 
            cursor={{fill: '#f8fafc'}}
            contentStyle={{
              borderRadius: '12px', 
              border: '1px solid #e2e8f0', 
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              fontSize: '12px',
              fontWeight: '600'
            }}
            formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, undefined]}
          />
          <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '12px', fontWeight: 700}} />
          <Bar dataKey="Revenue" fill="#007A65" radius={[6, 6, 0, 0]} maxBarSize={40} />
          <Bar dataKey="Expenses" fill="#EF4444" radius={[6, 6, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
