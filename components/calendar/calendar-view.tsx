'use client';

import { useState, useEffect } from 'react';
import { MaintenanceRequestWithRelations } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreateRequestForm } from '@/components/maintenance/create-request-form';
import { isOverdue } from '@/lib/utils';

interface CalendarViewProps {
  currentUserId: string;
  currentUserRole: string;
}

export function CalendarView({ currentUserId, currentUserRole }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [requests, setRequests] = useState<MaintenanceRequestWithRelations[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchPreventiveRequests();
  }, [currentDate]);

  const fetchPreventiveRequests = async () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    try {
      const response = await fetch(
        `/api/maintenance?requestType=PREVENTIVE&scheduledFrom=${startOfMonth.toISOString()}&scheduledTo=${endOfMonth.toISOString()}`
      );
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getRequestsForDate = (date: Date) => {
    return requests.filter(r => {
      if (!r.scheduledDate) return false;
      const scheduled = new Date(r.scheduledDate);
      return (
        scheduled.getDate() === date.getDate() &&
        scheduled.getMonth() === date.getMonth() &&
        scheduled.getFullYear() === date.getFullYear()
      );
    });
  };

  const handleDateClick = (date: Date) => {
    if (currentUserRole === 'MANAGER') {
      setSelectedDate(date);
      setShowCreateModal(true);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + (direction === 'prev' ? -1 : 1));
      return newDate;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const days = getDaysInMonth();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b bg-gray-50">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="min-h-[120px] border-b border-r bg-gray-50 p-2" />;
            }

            const dayRequests = getRequestsForDate(day);
            const hasOverdue = dayRequests.some(r => isOverdue(r.scheduledDate, r.stage));

            return (
              <div
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                className={`min-h-[120px] border-b border-r p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                  isToday(day) ? 'bg-blue-50' : ''
                }`}
              >
                <div className={`mb-1 text-sm font-medium ${isToday(day) ? 'text-blue-600' : 'text-gray-900'}`}>
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {dayRequests.slice(0, 3).map(req => (
                    <div
                      key={req.id}
                      className={`rounded px-1.5 py-0.5 text-xs truncate ${
                        isOverdue(req.scheduledDate, req.stage)
                          ? 'bg-red-100 text-red-800'
                          : req.stage === 'REPAIRED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {req.subject}
                    </div>
                  ))}
                  {dayRequests.length > 3 && (
                    <div className="text-xs text-gray-500">+{dayRequests.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showCreateModal && selectedDate && (
        <CreateRequestForm
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedDate(null);
          }}
          onSuccess={fetchPreventiveRequests}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          defaultType="PREVENTIVE"
          defaultDate={selectedDate.toISOString().slice(0, 16)}
        />
      )}
    </>
  );
}
