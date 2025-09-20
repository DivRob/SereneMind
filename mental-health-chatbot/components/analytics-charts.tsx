"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

interface AnalyticsChartsProps {
  data: any[]
  type: "tasks" | "mood"
}

export function AnalyticsCharts({ data, type }: AnalyticsChartsProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500">
        <p>No data available for the selected period</p>
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  if (type === "tasks") {
    const chartData = data.map((item) => ({
      date: formatDate(item.date),
      count: item.count || 0,
    }))

    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (type === "mood") {
    const chartData = data.map((item) => ({
      date: formatDate(item.date),
      mood: item.mood || 0,
      energy: item.energy || 0,
      stress: item.stress || 0,
    }))

    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
            <YAxis domain={[0, 10]} stroke="#64748b" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
              }}
            />
            <Line
              type="monotone"
              dataKey="mood"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
              name="Mood"
            />
            <Line
              type="monotone"
              dataKey="energy"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
              name="Energy"
            />
            <Line
              type="monotone"
              dataKey="stress"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
              name="Stress"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return null
}
