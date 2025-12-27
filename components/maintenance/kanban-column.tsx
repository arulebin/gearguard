'use client';

import { MaintenanceRequestWithRelations, RequestStage } from '@/types';
import { KanbanCard } from './kanban-card';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  title: string;
  stage: RequestStage;
  requests: MaintenanceRequestWithRelations[];
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragStart: (request: MaintenanceRequestWithRelations) => void;
  onRequestClick: (request: MaintenanceRequestWithRelations) => void;
}

const stageColors: Record<RequestStage, string> = {
  NEW: 'bg-blue-500',
  IN_PROGRESS: 'bg-yellow-500',
  REPAIRED: 'bg-green-500',
  SCRAP: 'bg-red-500',
};

export function KanbanColumn({
  title,
  stage,
  requests,
  onDragOver,
  onDrop,
  onDragStart,
  onRequestClick,
}: KanbanColumnProps) {
  return (
    <div
      className="flex w-80 flex-shrink-0 flex-col rounded-lg bg-gray-100"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="flex items-center gap-2 p-4">
        <div className={cn('h-3 w-3 rounded-full', stageColors[stage])} />
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className="ml-auto rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
          {requests.length}
        </span>
      </div>
      <div className="flex flex-col gap-3 p-3 pt-0 min-h-[200px]">
        {requests.map(request => (
          <KanbanCard
            key={request.id}
            request={request}
            onDragStart={() => onDragStart(request)}
            onClick={() => onRequestClick(request)}
          />
        ))}
        {requests.length === 0 && (
          <div className="flex h-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-sm text-gray-400">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}
