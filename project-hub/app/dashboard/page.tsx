'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import InviteTeamModal from '@/components/InviteTeamModal';

interface Project {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!storedToken) {
      router.push('/auth/login');
      return;
    }

    setToken(storedToken);
    setUser(JSON.parse(userData || '{}'));
    fetchProjects(storedToken);
  }, [router]);

  const fetchProjects = async (token: string) => {
    try {
      const response = await fetch('/api/projects', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Caricamento...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">ProjectHub</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 font-semibold">Ciao, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header with Title and Buttons */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">I tuoi Progetti</h2>
          <div className="flex gap-3">
            <Link
              href="/dashboard/projects/new"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              + Nuovo Progetto
            </Link>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              👥 Aggiungi dipendente
            </button>
            <a
              href="/dashboard/my-tasks"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition text-center"
            >
              📋 I miei task
            </a>
          </div>
        </div>

        {/* Projects Grid or Empty State */}
        {projects.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 mb-4 text-lg">Nessun progetto ancora</p>
            <Link
              href="/dashboard/projects/new"
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Crea il tuo primo progetto
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project._id}
                href={`/dashboard/projects/${project._id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer border-l-4 border-blue-600"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-2">{project.name}</h3>
                <p className="text-gray-600 mb-4">{project.description}</p>
                <p className="text-sm text-gray-500">
                  Creato: {new Date(project.createdAt).toLocaleDateString('it-IT')}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Invite Team Modal */}
      <InviteTeamModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInviteSuccess={() => {
          // Refresh projects if needed
        }}
        token={token}
      />
    </div>
  );
}
