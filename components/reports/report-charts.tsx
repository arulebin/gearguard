'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface TeamReport {
  label: string;
  total: number;
  new: number;
  inProgress: number;
  repaired: number;
  scrap: number;
}

interface CategoryReport {
  label: string;
  value: number;
}

export function ReportCharts() {
  const [teamData, setTeamData] = useState<TeamReport[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryReport[]>([]);
  const [stageData, setStageData] = useState<CategoryReport[]>([]);
  const [overview, setOverview] = useState({
    totalEquipment: 0,
    totalRequests: 0,
    openRequests: 0,
    overdueRequests: 0,
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [overviewRes, teamRes, categoryRes, stageRes] = await Promise.all([
        fetch('/api/reports?type=overview'),
        fetch('/api/reports?type=by-team'),
        fetch('/api/reports?type=by-category'),
        fetch('/api/reports?type=by-stage'),
      ]);

      if (overviewRes.ok) setOverview(await overviewRes.json());
      if (teamRes.ok) setTeamData(await teamRes.json());
      if (categoryRes.ok) setCategoryData(await categoryRes.json());
      if (stageRes.ok) setStageData(await stageRes.json());
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const maxTeamValue = Math.max(...teamData.map(t => t.total), 1);
  const maxCategoryValue = Math.max(...categoryData.map(c => c.value), 1);
  const maxStageValue = Math.max(...stageData.map(s => s.value), 1);

  const stageColors: Record<string, string> = {
    NEW: 'bg-blue-500',
    IN_PROGRESS: 'bg-yellow-500',
    REPAIRED: 'bg-green-500',
    SCRAP: 'bg-red-500',
  };

  const categoryColors: Record<string, string> = {
    MACHINE: 'bg-purple-500',
    VEHICLE: 'bg-orange-500',
    IT: 'bg-cyan-500',
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{overview.totalEquipment}</div>
            <p className="text-sm text-gray-500">Active Equipment</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{overview.totalRequests}</div>
            <p className="text-sm text-gray-500">Total Requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{overview.openRequests}</div>
            <p className="text-sm text-gray-500">Open Requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{overview.overdueRequests}</div>
            <p className="text-sm text-gray-500">Overdue Requests</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests by Team */}
        <Card>
          <CardHeader>
            <CardTitle>Requests by Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamData.map(team => (
                <div key={team.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{team.label}</span>
                    <span className="text-gray-500">{team.total}</span>
                  </div>
                  <div className="h-6 bg-gray-100 rounded-full overflow-hidden flex">
                    <div
                      className="bg-blue-500 h-full"
                      style={{ width: `${(team.new / Math.max(team.total, 1)) * 100}%` }}
                      title={`New: ${team.new}`}
                    />
                    <div
                      className="bg-yellow-500 h-full"
                      style={{ width: `${(team.inProgress / Math.max(team.total, 1)) * 100}%` }}
                      title={`In Progress: ${team.inProgress}`}
                    />
                    <div
                      className="bg-green-500 h-full"
                      style={{ width: `${(team.repaired / Math.max(team.total, 1)) * 100}%` }}
                      title={`Repaired: ${team.repaired}`}
                    />
                    <div
                      className="bg-red-500 h-full"
                      style={{ width: `${(team.scrap / Math.max(team.total, 1)) * 100}%` }}
                      title={`Scrap: ${team.scrap}`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded" />
                <span>New</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded" />
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded" />
                <span>Repaired</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded" />
                <span>Scrap</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Requests by Equipment Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData.map(cat => (
                <div key={cat.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{cat.label}</span>
                    <span className="text-gray-500">{cat.value}</span>
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${categoryColors[cat.label] || 'bg-gray-500'}`}
                      style={{ width: `${(cat.value / maxCategoryValue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Requests by Stage */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Requests by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-8 justify-center h-48">
              {stageData.map(stage => (
                <div key={stage.label} className="flex flex-col items-center">
                  <div className="text-lg font-bold mb-2">{stage.value}</div>
                  <div
                    className={`w-16 ${stageColors[stage.label] || 'bg-gray-500'} rounded-t`}
                    style={{ height: `${Math.max((stage.value / maxStageValue) * 120, 20)}px` }}
                  />
                  <div className="text-sm text-gray-600 mt-2">{stage.label.replace('_', ' ')}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
