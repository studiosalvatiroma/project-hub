'use client';

import { ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/core';

interface ColumnProps {
  title: string;
  children: ReactNode;
}

export default function Column({ title, children }: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: title,
  });

  return (
    <div
      ref={setNodeRef}
      className="bg-gray-100 rounded-lg p-4 min-h-96"
    >
      <h3 className="font-bold text-lg mb-4 text-gray-800">{title}</h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}
