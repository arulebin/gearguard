import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SmartButton } from '@/components/ui/smart-button';
import { Avatar } from '@/components/ui/avatar';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { formatDate, getCategoryColor, getStageColor } from '@/lib/utils';

async function getEquipment(id: string) {
  return prisma.equipment.findUnique({
    where: { id },
    include: {
      department: true,
      assignedEmployee: true,
      maintenanceTeam: {
        include: {
          technicians: true,
        },
      },
      maintenanceRequests: {
        include: {
          assignedTechnician: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });
}

export default async function EquipmentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  const equipment = await getEquipment(params.id);

  if (!equipment) {
    notFound();
  }

  const openRequestsCount = equipment.maintenanceRequests.filter(
    r => r.stage === 'NEW' || r.stage === 'IN_PROGRESS'
  ).length;

  return (
    <div className="flex flex-col">
      <Header user={user} />
      <div className="p-6">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Link href="/equipment" className="text-blue-600 hover:underline">
            ← Back to Equipment
          </Link>
        </div>

        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{equipment.name}</h1>
              {equipment.isScrapped && (
                <Badge variant="destructive">Scrapped</Badge>
              )}
            </div>
            <p className="text-gray-500">{equipment.serialNumber}</p>
          </div>
          <SmartButton
            href={`/maintenance?equipmentId=${equipment.id}`}
            icon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
            }
            label="Maintenance"
            count={openRequestsCount}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Equipment Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-gray-500">Category</dt>
                    <dd><Badge className={getCategoryColor(equipment.category)}>{equipment.category}</Badge></dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Department</dt>
                    <dd className="font-medium">{equipment.department.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Location</dt>
                    <dd className="font-medium">{equipment.location}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Purchase Date</dt>
                    <dd className="font-medium">{formatDate(equipment.purchaseDate)}</dd>
                  </div>
                  {equipment.warrantyEndDate && (
                    <div>
                      <dt className="text-sm text-gray-500">Warranty End</dt>
                      <dd className="font-medium">{formatDate(equipment.warrantyEndDate)}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm text-gray-500">Status</dt>
                    <dd>
                      <Badge variant={equipment.isScrapped ? 'destructive' : 'success'}>
                        {equipment.isScrapped ? 'Scrapped' : 'Active'}
                      </Badge>
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Recent Maintenance */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Maintenance Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {equipment.maintenanceRequests.length === 0 ? (
                  <p className="text-gray-500">No maintenance requests yet.</p>
                ) : (
                  <div className="space-y-3">
                    {equipment.maintenanceRequests.map(req => (
                      <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div>
                          <p className="font-medium text-gray-900">{req.subject}</p>
                          <p className="text-sm text-gray-500">{formatDate(req.createdAt)}</p>
                        </div>
                        <Badge className={getStageColor(req.stage)}>
                          {req.stage.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assigned Employee */}
            {equipment.assignedEmployee && (
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Employee</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={equipment.assignedEmployee.avatarUrl}
                      name={equipment.assignedEmployee.name}
                      size="lg"
                    />
                    <div>
                      <p className="font-medium">{equipment.assignedEmployee.name}</p>
                      <p className="text-sm text-gray-500">{equipment.assignedEmployee.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Maintenance Team */}
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Team</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-3">
                  <p className="font-medium">{equipment.maintenanceTeam.name}</p>
                  <p className="text-sm text-gray-500">{equipment.maintenanceTeam.specialization}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Technicians:</p>
                  {equipment.maintenanceTeam.technicians.map(tech => (
                    <div key={tech.id} className="flex items-center gap-2">
                      <Avatar src={tech.avatarUrl} name={tech.name} size="sm" />
                      <span className="text-sm">{tech.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
