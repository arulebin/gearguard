import { Header } from '@/components/layout/header';
import { KanbanBoard } from '@/components/maintenance/kanban-board';
import { MaintenancePageClient } from './client';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

async function getMaintenanceRequests() {
  return prisma.maintenanceRequest.findMany({
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
}

export default async function MaintenancePage() {
  const user = await getCurrentUser();
  const requests = await getMaintenanceRequests();

  return (
    <div className="flex flex-col">
      <Header user={user} />
      <MaintenancePageClient
        initialRequests={requests}
        currentUserId={user?.id || ''}
        currentUserRole={user?.role || 'EMPLOYEE'}
      />
    </div>
  );
}
