import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const teamId = searchParams.get('teamId');

    const where: any = {};
    if (role) where.role = role;
    if (teamId) {
      where.maintenanceTeams = {
        some: { id: teamId }
      };
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        department: true,
        maintenanceTeams: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, role, avatarUrl, departmentId } = body;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        avatarUrl,
        departmentId,
      },
      include: {
        department: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
