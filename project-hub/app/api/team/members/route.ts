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

    const userId = (decoded as any).userId;
    const user = memoryStore.findUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const teamMembers = memoryStore.findTeamMembers(user.currentTeam);

    // Return only necessary fields
    const members = teamMembers.map(m => ({
      _id: m._id,
      name: m.name,
      email: m.email,
    }));

    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
