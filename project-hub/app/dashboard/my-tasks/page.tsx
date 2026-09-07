'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ITask {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: 'low' | 'medium' | 'high';
  assignees: string[];
  dueDate?: string;
  project: string;
}

interface Project {
  _id: string;
  name: string;
}

export default function MyTasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [projects, setProjects] = useState<Map<string, Project>>(new Map());
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!storedToken) {
      router.push('/auth/login');
      return;
    }

    setToken(storedToken);
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.name);
    }

    fetchData(storedToken);
  }, [router]);

  const fetchData = async (token: string) => {
    try {
      // Fetch all tasks
      const tasksRes = await fetch('/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (tasksRes.ok) {
        const allTasks = await tasksRes.json();
        // Filter tasks assigned to current user
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const myTasks = allTasks.filter((t: ITask) => t.assignees.includes(user.name));
        setTasks(myTasks);

        // Fetch projects for these tasks
        const projectsRes = await fetch('/api/projects', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (projectsRes.ok) {
          const allProjects = await projectsRes.json();
          const projectMap = new Map();
          allProjects.forEach((p: Project) => {
            projectMap.set(p._id, p);
          });
          setProjects(projectMap);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
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
      console.error('Error updating task:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'To Do':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Done':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Caricamento...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">I miei task</h1>
            <p className="text-gray-600 text-sm">Ciao {userName}! Ecco i tuoi task assegnati</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Torna ai progetti
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {tasks.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-500 text-lg">Nessun task assegnato al momento 🎉</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task._id}
                className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition border-l-4 border-blue-600"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">{task.title}</h3>
                    <p className="text-sm text-gray-500">
                      Progetto: {projects.get(task.project)?.name || 'N/A'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(task.priority)}`}>
                    {task.priority.toUpperCase()}
                  </span>
                </div>

                {task.description && (
                  <p className="text-gray-700 mb-4 bg-gray-50 p-3 rounded">{task.description}</p>
                )}

                {task.dueDate && (
                  <p className="text-sm text-gray-600 mb-4">
                    📅 Scadenza: {new Date(task.dueDate).toLocaleDateString('it-IT')}
                  </p>
                )}

                <div className="flex gap-4 items-center">
                  <label className="font-semibold text-gray-700">Stato:</label>
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    className={`px-4 py-2 rounded-lg font-semibold border-2 ${getStatusColor(task.status)}`}
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
