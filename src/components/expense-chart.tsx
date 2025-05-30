"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const data = [
  { name: "Operacyjne", value: 8000, color: "#8884d8" },
  { name: "Marketing", value: 6000, color: "#82ca9d" },
  { name: "Subskrypcje", value: 3200, color: "#ffc658" },
  { name: "Sprzęt", value: 12800, color: "#ff7300" },
  { name: "Podróże", value: 2600, color: "#00ff00" },
]

export function ExpenseChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value.toLocaleString()} zł`} />
      </PieChart>
    </ResponsiveContainer>
  )
}
