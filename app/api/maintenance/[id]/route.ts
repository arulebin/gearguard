import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const maintenanceRequest = await prisma.maintenanceRequest.findUnique({
      where: { id: params.id },
      include: {
        equipment: {
          include: {
            department: true,
          },
        },
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
    });

    if (!maintenanceRequest) {
      return NextResponse.json({ error: 'Maintenance request not found' }, { status: 404 });
    }

    return NextResponse.json(maintenanceRequest);
  } catch (error) {
    console.error('Error fetching maintenance request:', error);
    return NextResponse.json({ error: 'Failed to fetch maintenance request' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { stage, assignedTechnicianId, durationHours, userId } = body;

    // Get current request state
    const currentRequest = await prisma.maintenanceRequest.findUnique({
      where: { id: params.id },
      include: {
        maintenanceTeam: {
          include: {
            technicians: true,
          },
        },
        equipment: true,
      },
    });

    if (!currentRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const updateData: any = { ...body };
    delete updateData.userId;

    // Handle stage transitions with business rules
    if (stage) {
      const technicianIds = currentRequest.maintenanceTeam.technicians.map((t) => t.id);

      // Transition to IN_PROGRESS: Must be a team technician
      if (stage === 'IN_PROGRESS' && currentRequest.stage === 'NEW') {
        if (!assignedTechnicianId || !technicianIds.includes(assignedTechnicianId)) {
          return NextResponse.json(
            { error: 'Only technicians from the assigned team can pick up this request' },
            { status: 403 }
          );
        }
        updateData.assignedTechnicianId = assignedTechnicianId;
      }

      // Transition to REPAIRED: Must be assigned technician and provide duration
      if (stage === 'REPAIRED' && currentRequest.stage === 'IN_PROGRESS') {
        if (currentRequest.assignedTechnicianId !== userId) {
          return NextResponse.json(
            { error: 'Only the assigned technician can mark this as repaired' },
            { status: 403 }
          );
        }
        if (!durationHours) {
          return NextResponse.json(
            { error: 'Duration is required before marking as repaired' },
            { status: 400 }
          );
        }
        updateData.durationHours = durationHours;
      }

      // Transition to SCRAP: Set equipment as scrapped
      if (stage === 'SCRAP') {
        await prisma.$transaction([
          prisma.equipment.update({
            where: { id: currentRequest.equipmentId },
            data: { isScrapped: true },
          }),
          prisma.maintenanceNote.create({
            data: {
              requestId: params.id,
              content: `Equipment "${currentRequest.equipment.name}" has been marked as scrapped and will no longer accept maintenance requests.`,
              isSystem: true,
            },
          }),
        ]);
      }
    }

    if (updateData.scheduledDate) {
      updateData.scheduledDate = new Date(updateData.scheduledDate);
    }

    const updatedRequest = await prisma.maintenanceRequest.update({
      where: { id: params.id },
      data: updateData,
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
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Error updating maintenance request:', error);
    return NextResponse.json({ error: 'Failed to update maintenance request' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.maintenanceRequest.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Maintenance request deleted successfully' });
  } catch (error) {
    console.error('Error deleting maintenance request:', error);
    return NextResponse.json({ error: 'Failed to delete maintenance request' }, { status: 500 });
  }
}
