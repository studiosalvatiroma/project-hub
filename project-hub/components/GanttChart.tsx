'use client';

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ITask {
  _id: string;
  title: string;
  startDate?: string;
  dueDate?: string;
  status: string;
  priority: 'low' | 'medium' | 'high';
  assignees: Array<{ name: string }>;
}

interface GanttChartProps {
  tasks: ITask[];
}

export default function GanttChart({ tasks }: GanttChartProps) {
  const ganttData = useMemo(() => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return tasks
      .filter((t) => t.startDate || t.dueDate)
      .map((task) => {
        const start = task.startDate
          ? new Date(task.startDate)
          : task.dueDate
          ? new Date(task.dueDate)
          : today;
        const end = task.dueDate ? new Date(task.dueDate) : today;

        const startOffset = Math.floor(
          (start.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24)
        );
        const duration = Math.floor(
          (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          name: task.title.substring(0, 20) + '...',
          start: Math.max(0, startOffset),
          duration: Math.max(1, duration),
          taskId: task._id,
        };
      });
  }, [tasks]);

  if (ganttData.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg text-center text-gray-500">
        No tasks with dates to display in Gantt chart
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg">
      <h3 className="text-xl font-bold mb-4">Project Timeline</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={ganttData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={190} />
          <Tooltip />
          <Bar dataKey="duration" stackId="a" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
