'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { MaintenanceRequestWithRelations } from '@/types';
import { formatDateTime, getStageColor, getCategoryColor, isOverdue } from '@/lib/utils';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: MaintenanceRequestWithRelations;
  currentUserId: string;
  currentUserRole: string;
  onUpdate: (request: MaintenanceRequestWithRelations) => void;
}

export function RequestModal({
  isOpen,
  onClose,
  request,
  currentUserId,
  currentUserRole,
  onUpdate,
}: RequestModalProps) {
  const [durationHours, setDurationHours] = useState(request.durationHours?.toString() || '');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const overdue = isOverdue(request.scheduledDate, request.stage);
  const canPickUp = 
    request.stage === 'NEW' && 
    currentUserRole === 'TECHNICIAN' && 
    request.maintenanceTeam.technicians.some(t => t.id === currentUserId);
  
  const canMarkRepaired = 
    request.stage === 'IN_PROGRESS' && 
    request.assignedTechnicianId === currentUserId;

  const canMarkScrap = 
    (request.stage === 'NEW' || request.stage === 'IN_PROGRESS') &&
    currentUserRole === 'MANAGER';

  const handlePickUp = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/maintenance/${request.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: 'IN_PROGRESS',
          assignedTechnicianId: currentUserId,
          userId: currentUserId,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        onUpdate(updated);
      }
    } catch (error) {
      console.error('Error picking up request:', error);
    }
    setLoading(false);
  };

  const handleMarkRepaired = async () => {
    if (!durationHours) {
      alert('Please enter duration hours');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/maintenance/${request.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: 'REPAIRED',
          durationHours: parseFloat(durationHours),
          userId: currentUserId,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        onUpdate(updated);
      }
    } catch (error) {
      console.error('Error marking repaired:', error);
    }
    setLoading(false);
  };

  const handleMarkScrap = async () => {
    if (!confirm('Are you sure you want to scrap this equipment? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/maintenance/${request.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: 'SCRAP',
          userId: currentUserId,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        onUpdate(updated);
      }
    } catch (error) {
      console.error('Error marking scrap:', error);
    }
    setLoading(false);
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/maintenance/${request.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: note,
          userId: currentUserId,
        }),
      });

      if (response.ok) {
        const newNote = await response.json();
        onUpdate({
          ...request,
          notes: [newNote, ...request.notes],
        });
        setNote('');
      }
    } catch (error) {
      console.error('Error adding note:', error);
    }
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Maintenance Request" className="max-w-2xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-xl font-semibold text-gray-900">{request.subject}</h3>
            <Badge className={getStageColor(request.stage)}>{request.stage.replace('_', ' ')}</Badge>
          </div>
          {overdue && (
            <div className="mt-2 flex items-center gap-2 text-red-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">This request is overdue!</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Type:</span>
            <Badge variant={request.requestType === 'CORRECTIVE' ? 'destructive' : 'default'} className="ml-2">
              {request.requestType}
            </Badge>
          </div>
          <div>
            <span className="text-gray-500">Equipment:</span>
            <span className="ml-2 font-medium">{request.equipment.name}</span>
          </div>
          <div>
            <span className="text-gray-500">Category:</span>
            <Badge className={`ml-2 ${getCategoryColor(request.equipment.category)}`}>
              {request.equipment.category}
            </Badge>
          </div>
          <div>
            <span className="text-gray-500">Team:</span>
            <span className="ml-2 font-medium">{request.maintenanceTeam.name}</span>
          </div>
          {request.scheduledDate && (
            <div>
              <span className="text-gray-500">Scheduled:</span>
              <span className="ml-2 font-medium">{formatDateTime(request.scheduledDate)}</span>
            </div>
          )}
          {request.durationHours && (
            <div>
              <span className="text-gray-500">Duration:</span>
              <span className="ml-2 font-medium">{request.durationHours} hours</span>
            </div>
          )}
          <div>
            <span className="text-gray-500">Created by:</span>
            <span className="ml-2 font-medium">{request.createdBy.name}</span>
          </div>
          <div>
            <span className="text-gray-500">Created:</span>
            <span className="ml-2">{formatDateTime(request.createdAt)}</span>
          </div>
        </div>

        {/* Assigned Technician */}
        {request.assignedTechnician && (
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
            <Avatar src={request.assignedTechnician.avatarUrl} name={request.assignedTechnician.name} />
            <div>
              <p className="font-medium text-gray-900">{request.assignedTechnician.name}</p>
              <p className="text-sm text-gray-500">Assigned Technician</p>
            </div>
          </div>
        )}

        {/* Description */}
        {request.description && (
          <div>
            <h4 className="mb-2 font-medium text-gray-900">Description</h4>
            <p className="text-sm text-gray-600">{request.description}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 border-t pt-4">
          {canPickUp && (
            <Button onClick={handlePickUp} disabled={loading}>
              Pick Up Request
            </Button>
          )}
          {canMarkRepaired && (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Duration (hours)"
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                className="w-40"
                step="0.5"
                min="0"
              />
              <Button onClick={handleMarkRepaired} disabled={loading}>
                Mark Repaired
              </Button>
            </div>
          )}
          {canMarkScrap && (
            <Button variant="destructive" onClick={handleMarkScrap} disabled={loading}>
              Mark as Scrap
            </Button>
          )}
        </div>

        {/* Notes */}
        <div className="border-t pt-4">
          <h4 className="mb-3 font-medium text-gray-900">Notes</h4>
          <div className="mb-3 flex gap-2">
            <Textarea
              placeholder="Add a note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="flex-1"
              rows={2}
            />
            <Button onClick={handleAddNote} disabled={loading || !note.trim()}>
              Add
            </Button>
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {request.notes.map((n) => (
              <div key={n.id} className={`rounded-lg p-3 text-sm ${n.isSystem ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">
                    {n.isSystem ? 'System' : n.user?.name || 'Unknown'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDateTime(n.createdAt)}
                  </span>
                </div>
                <p className="text-gray-600">{n.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
