'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TaskCard from '../../../components/TaskCard';
import TaskDetailsModal from '../../../components/TaskDetailsModal_SIMPLE';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import Column from '../../../components/Column';

interface ITask {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  project: string;
  assignees: string[];
  dueDate?: string;
  startDate?: string;
  labels: string[];
  createdAt: string;
}

interface IProject {
  _id: string;
  name: string;
  description: string;
  team: string;
  defaultColumns: string[];
  createdAt: string;
}

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<IProject | null>(null);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch project');
        const data = await response.json();
        setProject(data);
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchTasks = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/tasks`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch tasks');
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchProject();
    fetchTasks();
  }, [projectId, router]);

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (!over) return;

    const oldIndex = tasks.findIndex((task) => task._id === active.id);
    const newIndex = tasks.findIndex((task) => task._id === over.id);

    if (oldIndex !== newIndex) {
      const newTasks = arrayMove(tasks, oldIndex, newIndex);
      setTasks(newTasks);
    }
  };

  const handleTaskClick = (task: ITask) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleTaskUpdated = (updatedTask: ITask) => {
    setTasks(tasks.map((t) => (t._id === updatedTask._id ? updatedTask : t)));
    setShowTaskModal(false);
  };

  if (loading) return <div className="p-4">Caricamento...</div>;
  if (!project) return <div className="p-4">Progetto non trovato</div>;

  const columns = project.defaultColumns || ['To Do', 'In Progress', 'Done'];
  const tasksByStatus: { [key: string]: ITask[] } = {};

  columns.forEach((col) => {
    tasksByStatus[col] = tasks.filter((task) => task.status === col);
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">{project.name}</h1>
      <p className="text-gray-600 mb-6">{project.description}</p>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <Column key={column} title={column}>
              <SortableContext items={tasksByStatus[column]?.map((t) => t._id) || []}>
                {tasksByStatus[column]?.map((task) => (
                  <div key={task._id} onClick={() => handleTaskClick(task)} className="cursor-pointer">
                    <TaskCard task={task} />
                  </div>
                ))}
              </SortableContext>
            </Column>
          ))}
        </div>
      </DndContext>

      {showTaskModal && selectedTask && (
        <TaskDetailsModal task={selectedTask} onClose={() => setShowTaskModal(false)} onTaskUpdated={handleTaskUpdated} />
      )}
    </div>
  );
}
