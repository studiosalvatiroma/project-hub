'use client';

import React, { useState } from 'react';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Column from './Column';

interface Task {
  _id: string;
  title: string;
  status: string;
  priority: string;
  assignees: string[];
  dueDate?: string;
}

interface KanbanBoardProps {
  tasks: Task[];
  onTaskDrop?: (taskId: string, newStatus: string) => void;
}

export default function KanbanBoard({ tasks, onTaskDrop }: KanbanBoardProps) {
  const [taskList, setTaskList] = useState<Task[]>(tasks);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over) return;

    const activeIndex = taskList.findIndex((task) => task._id === active.id);
    const overIndex = taskList.findIndex((task) => task._id === over.id);

    if (activeIndex !== overIndex) {
      const newList = arrayMove(taskList, activeIndex, overIndex);
      setTaskList(newList);

      if (onTaskDrop) {
        const movedTask = newList[overIndex];
        onTaskDrop(movedTask._id, movedTask.status);
      }
    }
  };

  const columns = ['To Do', 'In Progress', 'Done'];
  const tasksByStatus: { [key: string]: Task[] } = {};

  columns.forEach((col) => {
    tasksByStatus[col] = taskList.filter((task) => task.status === col);
  });

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => (
          <Column key={column} title={column}>
            <SortableContext
              items={tasksByStatus[column]?.map((t) => t._id) || []}
              strategy={verticalListSortingStrategy}
            >
              {tasksByStatus[column]?.map((task) => (
                <div
                  key={task._id}
                  className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing"
                >
                  <h4 className="font-semibold text-gray-800">{task.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">Priority: {task.priority}</p>
                  {task.dueDate && <p className="text-sm text-gray-600">Due: {task.dueDate}</p>}
                </div>
              ))}
            </SortableContext>
          </Column>
        ))}
      </div>
    </DndContext>
  );
}
