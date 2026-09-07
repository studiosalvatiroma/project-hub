'use client';

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import TaskCard from './TaskCard';

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

interface KanbanBoardProps {
  tasks: ITask[];
  columns: string[];
  onTaskMove: (taskId: string, newStatus: string) => void;
  onTaskClick: (task: ITask) => void;
}

export default function KanbanBoard({
  tasks,
  columns,
  onTaskMove,
  onTaskClick,
}: KanbanBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;

    onTaskMove(taskId, newStatus);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        {columns.map((column) => (
          <div key={column} className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-bold text-lg mb-4 text-gray-700">{column}</h3>

            <SortableContext
              items={tasks
                .filter((t) => t.status === column)
                .map((t) => t._id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {tasks
                  .filter((t) => t.status === column)
                  .map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onClick={() => onTaskClick(task)}
                    />
                  ))}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>
    </DndContext>
  );
}
