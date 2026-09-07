'use client';

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface ITask {
  _id: string;
  status: string;
  priority: 'low' | 'medium' | 'high';
  assignees: Array<{ _id: string; name: string }>;
}

interface DashboardProps {
  tasks: ITask[];
}

export default function Dashboard({ tasks }: DashboardProps) {
  const statistics = useMemo(() => {
    const statusCount = tasks.reduce(
      (acc, task) => {
        const status = task.status || 'Unassigned';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const priorityCount = tasks.reduce(
      (acc, task) => {
        acc[task.priority || 'medium'] = (acc[task.priority || 'medium'] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const assigneeStats = tasks.reduce(
      (acc, task) => {
        task.assignees.forEach((assignee) => {
          const existing = acc.find((a) => a.name === assignee.name);
          if (existing) {
            existing.tasks += 1;
          } else {
            acc.push({ name: assignee.name, tasks: 1 });
          }
        });
        return acc;
      },
      [] as Array<{ name: string; tasks: number }>
    );

    return { statusCount, priorityCount, assigneeStats };
  }, [tasks]);

  const statusData = Object.entries(statistics.statusCount).map(([name, value]) => ({
    name,
    value,
  }));

  const priorityData = Object.entries(statistics.priorityCount).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Tasks by Status</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Tasks by Priority</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={priorityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Team Workload</h3>
        <div className="space-y-3">
          {statistics.assigneeStats.map((assignee) => (
            <div key={assignee.name} className="flex justify-between items-center">
              <span className="text-gray-700">{assignee.name}</span>
              <div className="w-40 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${(assignee.tasks / Math.max(...statistics.assigneeStats.map(a => a.tasks))) * 100}%`,
                  }}
                />
              </div>
              <span className="text-gray-600 text-sm ml-2">{assignee.tasks} tasks</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
