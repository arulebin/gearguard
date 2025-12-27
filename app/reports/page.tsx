import { Header } from '@/components/layout/header';
import { ReportCharts } from '@/components/reports/report-charts';
import { getCurrentUser } from '@/lib/auth';

export default async function ReportsPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col">
      <Header user={user} />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500">View maintenance statistics and performance metrics.</p>
        </div>

        <ReportCharts />
      </div>
    </div>
  );
}
