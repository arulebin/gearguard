import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function isOverdue(scheduledDate: Date | null, stage: string): boolean {
  if (!scheduledDate || stage === 'REPAIRED' || stage === 'SCRAP') return false;
  return new Date(scheduledDate) < new Date();
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getStageColor(stage: string): string {
  switch (stage) {
    case 'NEW':
      return 'bg-blue-100 text-blue-800';
    case 'IN_PROGRESS':
      return 'bg-yellow-100 text-yellow-800';
    case 'REPAIRED':
      return 'bg-green-100 text-green-800';
    case 'SCRAP':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getCategoryColor(category: string): string {
  switch (category) {
    case 'MACHINE':
      return 'bg-purple-100 text-purple-800';
    case 'VEHICLE':
      return 'bg-orange-100 text-orange-800';
    case 'IT':
      return 'bg-cyan-100 text-cyan-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
