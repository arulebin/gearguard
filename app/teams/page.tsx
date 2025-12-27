import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

async function getTeams() {
  return prisma.maintenanceTeam.findMany({
    include: {
      technicians: true,
      _count: {
        select: {
          equipment: true,
          maintenanceRequests: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export default async function TeamsPage() {
  const user = await getCurrentUser();
  const teams = await getTeams();

  return (
    <div className="flex flex-col">
      <Header user={user} />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Teams</h1>
          <p className="text-gray-500">Manage your maintenance teams and technicians.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map(team => (
            <Card key={team.id}>
              <CardHeader>
                <CardTitle>{team.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">{team.specialization}</p>
                
                <div className="flex gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{team._count.equipment}</p>
                    <p className="text-xs text-gray-500">Equipment</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{team._count.maintenanceRequests}</p>
                    <p className="text-xs text-gray-500">Requests</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Technicians ({team.technicians.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {team.technicians.map(tech => (
                      <div key={tech.id} className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1">
                        <Avatar src={tech.avatarUrl} name={tech.name} size="sm" />
                        <span className="text-sm">{tech.name}</span>
                      </div>
                    ))}
                    {team.technicians.length === 0 && (
                      <p className="text-sm text-gray-400">No technicians assigned</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
