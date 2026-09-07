import { memoryStore } from '@/lib/memoryStore';
import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);

    // Decode token to get current user ID
    let currentUserId: string;
    try {
      const decoded = jwtDecode<{ userId: string }>(token);
      currentUserId = decoded.userId;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Find current user
    const currentUser = memoryStore.findUserById(currentUserId);
    if (!currentUser) {
      return NextResponse.json({ error: 'Current user not found' }, { status: 404 });
    }

    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = memoryStore.findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Create new user in the same team as current user
    const newUser = memoryStore.createUser({
      email,
      name,
      password: 'temp-password-change-me', // Temporary password
      team: currentUser.team, // Same team as current user
    });

    // Create welcome notification
    memoryStore.createNotification({
      userId: newUser._id,
      message: `Benvenuto! ${currentUser.name} ti ha aggiunto al team. Password temporanea: temp-password-change-me`,
      taskId: '',
    });

    return NextResponse.json({
      success: true,
      message: 'Dipendente aggiunto con successo!',
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error('Error inviting team member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);

    // Decode token to get current user ID
    let currentUserId: string;
    try {
      const decoded = jwtDecode<{ userId: string }>(token);
      currentUserId = decoded.userId;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const currentUser = memoryStore.findUserById(currentUserId);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all team members
    const teamMembers = memoryStore.findTeamMembers(currentUser.team);

    return NextResponse.json(teamMembers);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
