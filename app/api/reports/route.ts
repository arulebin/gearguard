import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'overview';

    if (reportType === 'by-team') {
      const teams = await prisma.maintenanceTeam.findMany({
        include: {
          _count: {
            select: {
              maintenanceRequests: true,
            },
          },
          maintenanceRequests: {
            select: {
              stage: true,
            },
          },
        },
      });

      const data = teams.map((team) => ({
        label: team.name,
        total: team._count.maintenanceRequests,
        new: team.maintenanceRequests.filter((r) => r.stage === 'NEW').length,
        inProgress: team.maintenanceRequests.filter((r) => r.stage === 'IN_PROGRESS').length,
        repaired: team.maintenanceRequests.filter((r) => r.stage === 'REPAIRED').length,
        scrap: team.maintenanceRequests.filter((r) => r.stage === 'SCRAP').length,
      }));

      return NextResponse.json(data);
    }

    if (reportType === 'by-category') {
      const categories = ['MACHINE', 'VEHICLE', 'IT'];
      const data = await Promise.all(
        categories.map(async (category) => {
          const count = await prisma.maintenanceRequest.count({
            where: {
              equipment: {
                category: category as any,
              },
            },
          });
          return { label: category, value: count };
        })
      );

      return NextResponse.json(data);
    }

    if (reportType === 'by-stage') {
      const stages = ['NEW', 'IN_PROGRESS', 'REPAIRED', 'SCRAP'];
      const data = await Promise.all(
        stages.map(async (stage) => {
          const count = await prisma.maintenanceRequest.count({
            where: { stage: stage as any },
          });
          return { label: stage, value: count };
        })
      );

      return NextResponse.json(data);
    }

    // Default: overview
    const [totalEquipment, totalRequests, openRequests, overdueRequests] = await Promise.all([
      prisma.equipment.count({ where: { isScrapped: false } }),
      prisma.maintenanceRequest.count(),
      prisma.maintenanceRequest.count({
        where: { stage: { in: ['NEW', 'IN_PROGRESS'] } },
      }),
      prisma.maintenanceRequest.count({
        where: {
          scheduledDate: { lt: new Date() },
          stage: { notIn: ['REPAIRED', 'SCRAP'] },
        },
      }),
    ]);

    return NextResponse.json({
      totalEquipment,
      totalRequests,
      openRequests,
      overdueRequests,
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
