import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');
    const assignedEmployeeId = searchParams.get('assignedEmployeeId');
    const category = searchParams.get('category');
    const includeScrapped = searchParams.get('includeScrapped') === 'true';

    const where: any = {};
    if (departmentId) where.departmentId = departmentId;
    if (assignedEmployeeId) where.assignedEmployeeId = assignedEmployeeId;
    if (category) where.category = category;
    if (!includeScrapped) where.isScrapped = false;

    const equipment = await prisma.equipment.findMany({
      where,
      include: {
        department: true,
        assignedEmployee: true,
        maintenanceTeam: true,
        _count: {
          select: {
            maintenanceRequests: {
              where: {
                stage: { in: ['NEW', 'IN_PROGRESS'] },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return NextResponse.json({ error: 'Failed to fetch equipment' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      serialNumber,
      category,
      departmentId,
      assignedEmployeeId,
      location,
      purchaseDate,
      warrantyEndDate,
      maintenanceTeamId,
    } = body;

    const equipment = await prisma.equipment.create({
      data: {
        name,
        serialNumber,
        category,
        departmentId,
        assignedEmployeeId,
        location,
        purchaseDate: new Date(purchaseDate),
        warrantyEndDate: warrantyEndDate ? new Date(warrantyEndDate) : null,
        maintenanceTeamId,
      },
      include: {
        department: true,
        assignedEmployee: true,
        maintenanceTeam: true,
      },
    });

    return NextResponse.json(equipment, { status: 201 });
  } catch (error) {
    console.error('Error creating equipment:', error);
    return NextResponse.json({ error: 'Failed to create equipment' }, { status: 500 });
  }
}
