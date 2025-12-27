'use client';

import { useState, useEffect } from 'react';
import { MaintenanceRequestWithRelations, RequestStage } from '@/types';
import { KanbanColumn } from './kanban-column';
import { RequestModal } from './request-modal';

const COLUMNS: { id: RequestStage; title: string }[] = [
  { id: 'NEW', title: 'New' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'REPAIRED', title: 'Repaired' },
  { id: 'SCRAP', title: 'Scrap' },
];

interface KanbanBoardProps {
  initialRequests: MaintenanceRequestWithRelations[];
  currentUserId: string;
  currentUserRole: string;
}

export function KanbanBoard({ initialRequests, currentUserId, currentUserRole }: KanbanBoardProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequestWithRelations | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedRequest, setDraggedRequest] = useState<MaintenanceRequestWithRelations | null>(null);

  const handleDragStart = (request: MaintenanceRequestWithRelations) => {
    setDraggedRequest(request);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (targetStage: RequestStage) => {
    if (!draggedRequest || draggedRequest.stage === targetStage) {
      setDraggedRequest(null);
      return;
    }

    // Validate transitions
    const validTransitions: Record<RequestStage, RequestStage[]> = {
      NEW: ['IN_PROGRESS', 'SCRAP'],
      IN_PROGRESS: ['REPAIRED', 'SCRAP'],
      REPAIRED: [],
      SCRAP: [],
    };

    if (!validTransitions[draggedRequest.stage].includes(targetStage)) {
      alert('Invalid stage transition');
      setDraggedRequest(null);
      return;
    }

    // If moving to IN_PROGRESS, technician must be from the team
    if (targetStage === 'IN_PROGRESS') {
      const teamTechnicianIds = draggedRequest.maintenanceTeam.technicians.map(t => t.id);
      if (currentUserRole !== 'TECHNICIAN' || !teamTechnicianIds.includes(currentUserId)) {
        alert('Only technicians from the assigned team can pick up this request');
        setDraggedRequest(null);
        return;
      }
    }

    // If moving to REPAIRED, need duration - open modal
    if (targetStage === 'REPAIRED') {
      if (draggedRequest.assignedTechnicianId !== currentUserId) {
        alert('Only the assigned technician can mark this as repaired');
        setDraggedRequest(null);
        return;
      }
      setSelectedRequest(draggedRequest);
      setIsModalOpen(true);
      setDraggedRequest(null);
      return;
    }

    try {
      const body: any = { 
        stage: targetStage, 
        userId: currentUserId 
      };
      
      if (targetStage === 'IN_PROGRESS') {
        body.assignedTechnicianId = currentUserId;
      }

      const response = await fetch(`/api/maintenance/${draggedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const updatedRequest = await response.json();
        setRequests(prev => 
          prev.map(r => r.id === updatedRequest.id ? updatedRequest : r)
        );
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update request');
      }
    } catch (error) {
      console.error('Error updating request:', error);
    }

    setDraggedRequest(null);
  };

  const handleRequestClick = (request: MaintenanceRequestWithRelations) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleRequestUpdate = (updatedRequest: MaintenanceRequestWithRelations) => {
    setRequests(prev => 
      prev.map(r => r.id === updatedRequest.id ? updatedRequest : r)
    );
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const getColumnRequests = (stage: RequestStage) => {
    return requests.filter(r => r.stage === stage);
  };

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(column => (
          <KanbanColumn
            key={column.id}
            title={column.title}
            stage={column.id}
            requests={getColumnRequests(column.id)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
            onDragStart={handleDragStart}
            onRequestClick={handleRequestClick}
          />
        ))}
      </div>

      {selectedRequest && (
        <RequestModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRequest(null);
          }}
          request={selectedRequest}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          onUpdate={handleRequestUpdate}
        />
      )}
    </>
  );
}
