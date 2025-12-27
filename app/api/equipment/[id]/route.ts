import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const equipment = await prisma.equipment.findUnique({
      where: { id: params.id },
      include: {
        department: true,
        assignedEmployee: true,
        maintenanceTeam: {
          include: {
            technicians: true,
          },
        },
        maintenanceRequests: {
          include: {
            assignedTechnician: true,
            createdBy: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!equipment) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
    }

    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return NextResponse.json({ error: 'Failed to fetch equipment' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    if (body.purchaseDate) body.purchaseDate = new Date(body.purchaseDate);
    if (body.warrantyEndDate) body.warrantyEndDate = new Date(body.warrantyEndDate);

    const equipment = await prisma.equipment.update({
      where: { id: params.id },
      data: body,
      include: {
        department: true,
        assignedEmployee: true,
        maintenanceTeam: true,
      },
    });

    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Error updating equipment:', error);
    return NextResponse.json({ error: 'Failed to update equipment' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.equipment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    return NextResponse.json({ error: 'Failed to delete equipment' }, { status: 500 });
  }
}
