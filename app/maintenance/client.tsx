'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { KanbanBoard } from '@/components/maintenance/kanban-board';
import { CreateRequestForm } from '@/components/maintenance/create-request-form';
import { MaintenanceRequestWithRelations } from '@/types';

interface MaintenancePageClientProps {
  initialRequests: MaintenanceRequestWithRelations[];
  currentUserId: string;
  currentUserRole: string;
}

export function MaintenancePageClient({
  initialRequests,
  currentUserId,
  currentUserRole,
}: MaintenancePageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const equipmentId = searchParams.get('equipmentId');
  
  // Filter requests if equipmentId is provided
  const filteredRequests = equipmentId
    ? initialRequests.filter(r => r.equipmentId === equipmentId)
    : initialRequests;

  const handleCreateSuccess = () => {
    router.refresh();
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Requests</h1>
          <p className="text-gray-500">
            {equipmentId
              ? 'Showing requests for selected equipment'
              : 'Drag and drop requests to update their status'}
          </p>
        </div>
        <div className="flex gap-3">
          {equipmentId && (
            <Button variant="outline" onClick={() => router.push('/maintenance')}>
              Show All
            </Button>
          )}
          <Button onClick={() => setShowCreateModal(true)}>
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Request
          </Button>
        </div>
      </div>

      <KanbanBoard
        initialRequests={filteredRequests}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
      />

      <CreateRequestForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
      />
    </div>
  );
}
