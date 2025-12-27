import { Header } from '@/components/layout/header';
import { CalendarView } from '@/components/calendar/calendar-view';
import { getCurrentUser } from '@/lib/auth';

export default async function CalendarPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col">
      <Header user={user} />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Calendar</h1>
          <p className="text-gray-500">
            View scheduled preventive maintenance. 
            {user?.role === 'MANAGER' && ' Click on a date to schedule new maintenance.'}
          </p>
        </div>

        <CalendarView
          currentUserId={user?.id || ''}
          currentUserRole={user?.role || 'EMPLOYEE'}
        />
      </div>
    </div>
  );
}
