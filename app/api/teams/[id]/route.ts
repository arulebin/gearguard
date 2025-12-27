import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const team = await prisma.maintenanceTeam.findUnique({
      where: { id: params.id },
      include: {
        technicians: true,
        equipment: true,
        maintenanceRequests: {
          include: {
            equipment: true,
            assignedTechnician: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    return NextResponse.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { technicianIds, ...data } = body;

    const updateData: any = { ...data };
    if (technicianIds) {
      updateData.technicians = {
        set: technicianIds.map((id: string) => ({ id })),
      };
    }

    const team = await prisma.maintenanceTeam.update({
      where: { id: params.id },
      data: updateData,
      include: {
        technicians: true,
      },
    });

    return NextResponse.json(team);
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json({ error: 'Failed to update team' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.maintenanceTeam.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 });
  }
}
