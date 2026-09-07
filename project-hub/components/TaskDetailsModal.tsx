// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';

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

interface TeamMember {
  _id: string;
  name: string;
  email: string;
}

interface TaskDetailsModalProps {
  task: ITask | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<ITask>) => void;
  token: string;
}

export default function TaskDetailsModal({
  task,
  isOpen,
  onClose,
  onUpdate,
  token,
}: TaskDetailsModalProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && task) {
      setSelectedAssignee(task.assignees?.[0] || '');
      setSelectedStatus(task.status || 'To Do');
      fetchTeamMembers();
    }
  }, [isOpen, task]);

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('/api/team/members', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const members = await response.json();
        setTeamMembers(members);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleAssigneeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAssignee = e.target.value;
    setSelectedAssignee(newAssignee);
    setLoading(true);

    try {
      const response = await fetch(`/api/tasks/${task?._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assignees: newAssignee ? [newAssignee] : [],
        }),
      });

      if (response.ok) {
        onUpdate(task!._id, { assignees: newAssignee ? [newAssignee] : [] });

        // Create notification for assignee
        if (newAssignee) {
          await fetch('/api/notifications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              userId: newAssignee,
              message: `Ti è stato assegnato il task: ${task?.title}`,
              taskId: task?._id,
            }),
          });
        }
      }
    } catch (error) {
      console.error('Error updating assignee:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setSelectedStatus(newStatus);
    setLoading(true);

    try {
      const response = await fetch(`/api/tasks/${task?._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        onUpdate(task!._id, { status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">{task.title}</h2>

        {/* Assign Dropdown */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">Assegna a</label>
          <select
            value={selectedAssignee}
            onChange={handleAssigneeChange}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100"
          >
            <option value="">-- Seleziona dipendente --</option>
            {teamMembers.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">Stato</label>
          <select
            value={selectedStatus}
            onChange={handleStatusChange}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100"
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-400 transition"
        >
          Chiudi
        </button>
      </div>
    </div>
  );
}

