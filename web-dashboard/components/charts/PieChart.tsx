import React from "react";
import { PieChart as Chart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

export type PieChartData = {
  name: string;
  value: number;
  color?: string;
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28BFE", "#FE6B8B", "#B2FF59", "#FFD700"];

export const PieChart: React.FC<{ data: PieChartData[]; height?: number }> = ({ data, height = 260 }) => {
  const total = data.reduce((sum, d) => sum + (Number.isFinite(d.value) ? d.value : 0), 0);
  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      <ResponsiveContainer width="100%" height={height}>
        <Chart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={48}
            outerRadius={90}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number | string, name: string) => [String(value), String(name)]} />
          <Legend verticalAlign="bottom" height={24} />
        </Chart>
      </ResponsiveContainer>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: '#6b7280' }}>Total Users</div>
        <div style={{ fontSize: 20, fontWeight: 600 }}>{total}</div>
      </div>
    </div>
  );
};
