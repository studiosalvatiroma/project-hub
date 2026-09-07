'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ITask {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: 'low' | 'medium' | 'high';
  assignees: Array<{ name: string; email: string }>;
  dueDate?: string;
  labels: string[];
}

interface TaskCardProps {
  task: ITask;
  onClick: () => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColor = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-blue-100 text-blue-800',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:shadow-lg cursor-grab active:cursor-grabbing transition-all"
    >
      <h4 className="font-semibold text-gray-800 mb-2">{task.title}</h4>

      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`text-xs px-2 py-1 rounded font-semibold ${priorityColor[task.priority]}`}>
          {task.priority}
        </span>

        {task.labels.map((label) => (
          <span key={label} className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
            {label}
          </span>
        ))}
      </div>

      {task.dueDate && (
        <p className="text-xs text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
      )}

      {task.assignees.length > 0 && (
        <div className="mt-3 flex -space-x-2">
          {task.assignees.slice(0, 3).map((assignee) => (
            <div
              key={assignee.email}
              className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white"
              title={assignee.name}
            >
              {assignee.name.charAt(0)}
            </div>
          ))}
          {task.assignees.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-xs font-bold border-2 border-white">
              +{task.assignees.length - 3}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
