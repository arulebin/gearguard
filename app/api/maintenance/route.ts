import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const equipmentId = searchParams.get('equipmentId');
    const teamId = searchParams.get('teamId');
    const stage = searchParams.get('stage');
    const requestType = searchParams.get('requestType');
    const scheduledFrom = searchParams.get('scheduledFrom');
    const scheduledTo = searchParams.get('scheduledTo');

    const where: any = {};
    if (equipmentId) where.equipmentId = equipmentId;
    if (teamId) where.maintenanceTeamId = teamId;
    if (stage) where.stage = stage;
    if (requestType) where.requestType = requestType;
    if (scheduledFrom || scheduledTo) {
      where.scheduledDate = {};
      if (scheduledFrom) where.scheduledDate.gte = new Date(scheduledFrom);
      if (scheduledTo) where.scheduledDate.lte = new Date(scheduledTo);
    }

    const requests = await prisma.maintenanceRequest.findMany({
      where,
      include: {
        equipment: true,
        maintenanceTeam: {
          include: {
            technicians: true,
          },
        },
        assignedTechnician: true,
        createdBy: true,
        notes: {
          include: {
            user: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
    return NextResponse.json({ error: 'Failed to fetch maintenance requests' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, requestType, equipmentId, scheduledDate, description, createdById } = body;

    // Validate equipment exists and is not scrapped
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: { maintenanceTeam: true },
    });

    if (!equipment) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
    }

    if (equipment.isScrapped) {
      return NextResponse.json({ error: 'Cannot create request for scrapped equipment' }, { status: 400 });
    }

    // Auto-fill maintenance team from equipment
    const maintenanceTeamId = equipment.maintenanceTeamId;

    // Validate preventive request requires scheduled date
    if (requestType === 'PREVENTIVE' && !scheduledDate) {
      return NextResponse.json({ error: 'Scheduled date is required for preventive maintenance' }, { status: 400 });
    }

    const maintenanceRequest = await prisma.maintenanceRequest.create({
      data: {
        subject,
        requestType,
        equipmentId,
        maintenanceTeamId,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        description,
        createdById,
        stage: 'NEW',
      },
      include: {
        equipment: true,
        maintenanceTeam: {
          include: {
            technicians: true,
          },
        },
        assignedTechnician: true,
        createdBy: true,
        notes: true,
      },
    });

    return NextResponse.json(maintenanceRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating maintenance request:', error);
    return NextResponse.json({ error: 'Failed to create maintenance request' }, { status: 500 });
  }
}
