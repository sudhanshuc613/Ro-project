'use client';

import {
  Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { compactINR, formatINR } from '@/lib/utils/format';

interface Point {
  day: string;
  ecommerce: number;
  service: number;
  orders: number;
}

export default function RevenueChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="gEcom" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gSvc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} tickFormatter={(v) => compactINR(Number(v))} />
        <Tooltip
          formatter={(value: number, name) => [formatINR(value), name === 'ecommerce' ? 'E-commerce' : 'Service']}
          contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 13 }}
        />
        <Legend
          iconType="circle"
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          formatter={(v) => (v === 'ecommerce' ? 'E-commerce (Pan-India)' : 'Service (Patna)')}
        />
        <Area type="monotone" dataKey="ecommerce" stroke="#06B6D4" strokeWidth={2.5} fill="url(#gEcom)" />
        <Area type="monotone" dataKey="service" stroke="#F97316" strokeWidth={2.5} fill="url(#gSvc)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
