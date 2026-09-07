import { memoryStore } from '@/lib/memoryStore';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'secret');
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === 'string') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const projectId = request.nextUrl.searchParams.get('projectId');
    const tasks = projectId
      ? memoryStore.findTasksByProject(projectId)
      : Array.from(memoryStore.tasks.values());

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === 'string') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { title, description, project, priority = 'medium', assignees = [], labels = [], dueDate } =
      await request.json();

    const task = memoryStore.createTask({
      title,
      description,
      project,
      status: 'To Do',
      priority,
      assignees,
      labels,
      dueDate,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
