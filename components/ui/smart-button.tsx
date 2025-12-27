import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SmartButtonProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  count?: number;
  className?: string;
}

export function SmartButton({ href, icon, label, count, className }: SmartButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors',
        className
      )}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && (
        <span className="ml-1 inline-flex items-center justify-center rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
