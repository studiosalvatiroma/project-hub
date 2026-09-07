'use client';

import { useState } from 'react';

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

interface TeamMember {
  _id: string;
  name: string;
  email: string;
}

interface TaskDetailsModalProps {
  task: ITask;
  onClose: () => void;
  onTaskUpdated: (task: ITask) => void;
}

export default function TaskDetailsModal({ task, onClose, onTaskUpdated }: TaskDetailsModalProps) {
  const [assignees, setAssignees] = useState<string[]>(task.assignees || []);
  const [status, setStatus] = useState(task.status);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch team members on mount
  const fetchTeamMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/team/invite', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const members = await response.json();
        setTeamMembers(members);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  // Handle assignee selection
  const handleAssigneeChange = (memberId: string) => {
    if (assignees.includes(memberId)) {
      setAssignees(assignees.filter((id) => id !== memberId));
    } else {
      setAssignees([...assignees, memberId]);
    }
  };

  // Save changes
  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          assignees,
        }),
      });

      if (response.ok) {
        const updatedTask = await response.json();

        // Create notifications for newly assigned users
        for (const memberId of assignees) {
          if (!task.assignees.includes(memberId)) {
            const member = teamMembers.find((m) => m._id === memberId);
            if (member) {
              await fetch('/api/notifications', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  userId: memberId,
                  message: `Ti è stato assegnato il task: ${task.title}`,
                  taskId: task._id,
                }),
              });
            }
          }
        }

        onTaskUpdated(updatedTask);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch team members when modal opens
  if (teamMembers.length === 0) {
    fetchTeamMembers();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">{task.title}</h2>

        {/* Assign To Dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">👤 Assegna a:</label>
          <div className="border border-gray-300 rounded p-3 max-h-48 overflow-y-auto">
            {teamMembers.length > 0 ? (
              teamMembers.map((member) => (
                <label key={member._id} className="flex items-center mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={assignees.includes(member._id)}
                    onChange={() => handleAssigneeChange(member._id)}
                    className="mr-2"
                  />
                  <span className="text-sm">{member.name}</span>
                </label>
              ))
            ) : (
              <p className="text-sm text-gray-500">Caricamento dipendenti...</p>
            )}
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">📋 Stato:</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm font-semibold"
            disabled={loading}
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-semibold"
            disabled={loading}
          >
            {loading ? 'Salvataggio...' : 'Salva'}
          </button>
        </div>
      </div>
    </div>
  );
}
