// @ts-nocheck
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">ProjectHub</h1>
          <div className="space-x-4">
            {isLoggedIn ? (
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  setIsLoggedIn(false);
                  router.push('/');
                }}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-20 text-center text-white">
        <h2 className="text-5xl font-bold mb-4">Gestisci i tuoi progetti senza limiti</h2>
        <p className="text-xl mb-8 opacity-90">
          ProjectHub: alternativa gratuita a Monday.com con Kanban, Timeline, Collaborazione real-time
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-8 text-gray-800">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Kanban Board</h3>
            <p>Gestisci i task con vista colonne interattiva e drag-and-drop</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-gray-800">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-bold mb-2">Timeline/Gantt</h3>
            <p>Visualizza i progetti su timeline e pianifica le milestone</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-gray-800">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold mb-2">Team Collaboration</h3>
            <p>Collabora con il team: commenti, @mention, notifiche real-time</p>
          </div>
        </div>

        {!isLoggedIn && (
          <Link
            href="/auth/register"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100"
          >
            Inizia Gratis
          </Link>
        )}

        {isLoggedIn && (
          <Link
            href="/dashboard"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100"
          >
            Vai al Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}
