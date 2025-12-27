import { Header } from '@/components/layout/header';
import { EquipmentList } from '@/components/equipment/equipment-list';
import { getCurrentUser } from '@/lib/auth';

export default async function EquipmentPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col">
      <Header user={user} />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Equipment</h1>
          <p className="text-gray-500">Manage your equipment inventory and view maintenance history.</p>
        </div>

        <EquipmentList />
      </div>
    </div>
  );
}
