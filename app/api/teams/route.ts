import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const teams = await prisma.maintenanceTeam.findMany({
      include: {
        technicians: true,
        _count: {
          select: {
            equipment: true,
            maintenanceRequests: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, specialization, technicianIds } = body;

    const team = await prisma.maintenanceTeam.create({
      data: {
        name,
        specialization,
        technicians: {
          connect: technicianIds?.map((id: string) => ({ id })) || [],
        },
      },
      include: {
        technicians: true,
      },
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  }
}
