'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ITask {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  project: string;
  assignees: string[];
  dueDate?: string;
  labels: string[];
  createdAt: string;
}

interface TaskCardProps {
  task: ITask;
}

export default function TaskCard({ task }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColor = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing"
    >
      <h4 className="font-semibold text-gray-800 text-sm mb-2">{task.title}</h4>

      {task.description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            priorityColor[task.priority as keyof typeof priorityColor] || 'bg-gray-100'
          }`}
        >
          {task.priority}
        </span>

        {task.dueDate && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            📅 {task.dueDate}
          </span>
        )}
      </div>

      {task.assignees.length > 0 && (
        <div className="mt-2 text-xs text-gray-600">
          👤 {task.assignees.length} assegnato
        </div>
      )}
    </div>
  );
}
