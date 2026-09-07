import { memoryStore } from '@/lib/memoryStore';
import { NextRequest, NextResponse } from 'next/server';

// Helper to decode JWT manually without external library
function decodeToken(token: string): { userId: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf-8')
    );

    return payload;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const decoded = decodeToken(token);

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Find current user
    const currentUser = memoryStore.findUserById(decoded.userId);
    if (!currentUser) {
      return NextResponse.json({ error: 'Current user not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, email } = body;

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
    const decoded = decodeToken(token);

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const currentUser = memoryStore.findUserById(decoded.userId);
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
