'use client';

import { MaintenanceRequestWithRelations } from '@/types';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { isOverdue, formatDate, getCategoryColor } from '@/lib/utils';

interface KanbanCardProps {
  request: MaintenanceRequestWithRelations;
  onDragStart: () => void;
  onClick: () => void;
}

export function KanbanCard({ request, onDragStart, onClick }: KanbanCardProps) {
  const overdue = isOverdue(request.scheduledDate, request.stage);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={`relative cursor-pointer rounded-lg bg-white p-4 shadow-sm border transition-shadow hover:shadow-md ${
        overdue ? 'border-l-4 border-l-red-500' : 'border-gray-200'
      }`}
    >
      {overdue && (
        <div className="absolute -top-2 -right-2">
          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
            Overdue
          </span>
        </div>
      )}
      
      <div className="mb-2 flex items-start justify-between gap-2">
        <h4 className="font-medium text-gray-900 line-clamp-2">{request.subject}</h4>
      </div>
      
      <div className="mb-3 flex flex-wrap gap-1">
        <Badge variant={request.requestType === 'CORRECTIVE' ? 'destructive' : 'default'}>
          {request.requestType}
        </Badge>
        <Badge className={getCategoryColor(request.equipment.category)}>
          {request.equipment.category}
        </Badge>
      </div>
      
      <div className="mb-3 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
          <span className="truncate">{request.equipment.name}</span>
        </div>
      </div>

      {request.scheduledDate && (
        <div className="mb-3 text-xs text-gray-500">
          Scheduled: {formatDate(request.scheduledDate)}
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{request.maintenanceTeam.name}</span>
        {request.assignedTechnician && (
          <Avatar
            src={request.assignedTechnician.avatarUrl}
            name={request.assignedTechnician.name}
            size="sm"
          />
        )}
      </div>
    </div>
  );
}
