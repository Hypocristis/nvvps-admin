"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

const data = [
  { month: "Sty", revenue: 106800, expenses: 32600 },
  { month: "Lut", revenue: 44000, expenses: 19400 },
  { month: "Mar", revenue: 74000, expenses: 24800 },
  { month: "Kwi", revenue: 89200, expenses: 28400 },
  { month: "Maj", revenue: 79200, expenses: 23600 },
  { month: "Cze", revenue: 98000, expenses: 33200 },
]

export function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip
          formatter={(value, name) => [`${value.toLocaleString()} zł`, name === "revenue" ? "Przychody" : "Wydatki"]}
        />
        <Legend />
        <Bar dataKey="revenue" fill="#8884d8" name="Przychody" />
        <Bar dataKey="expenses" fill="#82ca9d" name="Wydatki" />
      </BarChart>
    </ResponsiveContainer>
  )
}
