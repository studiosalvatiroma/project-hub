'use client';

import { useState } from 'react';

interface InviteTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteSuccess: () => void;
  token: string;
}

export default function InviteTeamModal({
  isOpen,
  onClose,
  onInviteSuccess,
  token,
}: InviteTeamModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !name.trim()) {
      alert('Inserisci email e nome del dipendente');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, name }),
      });

      if (response.ok) {
        alert('Dipendente aggiunto! Ha ricevuto una notifica');
        setEmail('');
        setName('');
        onInviteSuccess();
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || 'Errore nell\'aggiunta del dipendente');
      }
    } catch (error) {
      console.error('Error inviting user:', error);
      alert('Errore nell\'aggiunta del dipendente');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Aggiungi dipendente</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Es: Marco Rossi"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Es: marco@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isSubmitting ? 'Aggiungendo...' : 'Aggiungi'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-400"
            >
              Annulla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
