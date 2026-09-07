'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import KanbanBoard from '@/components/KanbanBoard';
import GanttChart from '@/components/GanttChart';
import Dashboard from '@/components/Dashboard';
import TaskDetailsModal from '@/components/TaskDetailsModal_SIMPLE';

interface ITask {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: 'low' | 'medium' | 'high';
  assignees: string[];
  dueDate?: string;
  labels: string[];
}

interface IProject {
  _id: string;
  name: string;
  description: string;
  defaultColumns: string[];
}

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<IProject | null>(null);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'kanban' | 'gantt' | 'stats'>('kanban');
  const [token, setToken] = useState('');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      router.push('/auth/login');
      return;
    }
    setToken(storedToken);
  }, [router]);

  useEffect(() => {
    if (!token || !projectId) return;

    const fetchData = async () => {
      try {
        setProject({
          _id: projectId,
          name: 'Sample Project',
          description: 'Your project description',
          defaultColumns: ['To Do', 'In Progress', 'Review', 'Done'],
        });

        const tasksRes = await fetch(`/api/tasks?projectId=${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (tasksRes.ok) {
          setTasks(await tasksRes.json());
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, projectId]);

  const handleTaskMove = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setTasks(
          tasks.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
        );
      }
    } catch (error) {
      console.error('Error moving task:', error);
    }
  };

  const handleTaskClick = (task: ITask) => {
    setSelectedTask(task);
  };

  const handleUpdateTask = (taskId: string, updates: Partial<ITask>) => {
    setTasks(
      tasks.map((t) => (t._id === taskId ? { ...t, ...updates } : t))
    );
    if (selectedTask && selectedTask._id === taskId) {
      setSelectedTask({ ...selectedTask, ...updates });
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      alert('Titolo task obbligatorio!');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          project: projectId,
          priority: newTask.priority,
          dueDate: newTask.dueDate || undefined,
          assignees: [],
          labels: [],
        }),
      });

      if (response.ok) {
        const createdTask = await response.json();
        setTasks([...tasks, createdTask]);
        setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
        setShowAddTaskModal(false);
        alert('Task creato con successo!');
      } else {
        alert('Errore nella creazione del task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Errore nella creazione del task');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Caricamento...</div>;
  }

  if (!project) {
    return <div className="flex items-center justify-center h-screen">Project not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">{project.name}</h1>
            <p className="text-gray-600 text-sm">{project.description}</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-900 font-semibold"
          >
            ← Indietro
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-4 mb-6 justify-between items-center">
          <div className="flex gap-4">
            <button
              onClick={() => setView('kanban')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                view === 'kanban'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              📊 Kanban
            </button>
            <button
              onClick={() => setView('gantt')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                view === 'gantt'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              📅 Timeline
            </button>
            <button
              onClick={() => setView('stats')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                view === 'stats'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              📈 Statistics
            </button>
          </div>

          <button
            onClick={() => setShowAddTaskModal(true)}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
          >
            + Add Task
          </button>
        </div>

        {showAddTaskModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-6">Add New Task</h2>
              <form onSubmit={handleAddTask}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Title *</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Task title"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Task description"
                    rows={3}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Task'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddTaskModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {view === 'kanban' && (
          <KanbanBoard
            tasks={tasks}
            columns={project.defaultColumns}
            onTaskMove={handleTaskMove}
            onTaskClick={handleTaskClick}
          />
        )}

        {view === 'gantt' && <GanttChart tasks={tasks} />}

        {view === 'stats' && <Dashboard tasks={tasks} />}

        {selectedTask && (
          <TaskDetailsModal
            task={selectedTask}
            isOpen={!!selectedTask}
            onClose={() => setSelectedTask(null)}
            onUpdate={handleUpdateTask}
            token={token}
          />
        )}
      </div>
    </div>
  );
}
