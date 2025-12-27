'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { EquipmentWithRelations, Department, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SmartButton } from '@/components/ui/smart-button';
import { formatDate, getCategoryColor } from '@/lib/utils';

export function EquipmentList() {
  const [equipment, setEquipment] = useState<EquipmentWithRelations[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [filters, setFilters] = useState({
    departmentId: '',
    assignedEmployeeId: '',
    category: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.departmentId) params.append('departmentId', filters.departmentId);
      if (filters.assignedEmployeeId) params.append('assignedEmployeeId', filters.assignedEmployeeId);
      if (filters.category) params.append('category', filters.category);

      const [eqRes, deptRes, userRes] = await Promise.all([
        fetch(`/api/equipment?${params}`),
        fetch('/api/departments'),
        fetch('/api/users?role=EMPLOYEE'),
      ]);

      if (eqRes.ok) setEquipment(await eqRes.json());
      if (deptRes.ok) setDepartments(await deptRes.json());
      if (userRes.ok) setEmployees(await userRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const clearFilters = () => {
    setFilters({ departmentId: '', assignedEmployeeId: '', category: '' });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 rounded-lg border bg-white p-4">
        <Select
          value={filters.departmentId}
          onChange={(e) => setFilters(prev => ({ ...prev, departmentId: e.target.value }))}
          className="w-48"
        >
          <option value="">All Departments</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.id}>{dept.name}</option>
          ))}
        </Select>

        <Select
          value={filters.assignedEmployeeId}
          onChange={(e) => setFilters(prev => ({ ...prev, assignedEmployeeId: e.target.value }))}
          className="w-48"
        >
          <option value="">All Employees</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.name}</option>
          ))}
        </Select>

        <Select
          value={filters.category}
          onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
          className="w-48"
        >
          <option value="">All Categories</option>
          <option value="MACHINE">Machine</option>
          <option value="VEHICLE">Vehicle</option>
          <option value="IT">IT</option>
        </Select>

        <Button variant="outline" onClick={clearFilters}>
          Clear Filters
        </Button>
      </div>

      {/* Equipment Table */}
      <div className="rounded-lg border bg-white overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Equipment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Maintenance
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : equipment.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No equipment found
                </td>
              </tr>
            ) : (
              equipment.map(eq => (
                <tr key={eq.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link href={`/equipment/${eq.id}`} className="hover:text-blue-600">
                      <div className="font-medium text-gray-900">{eq.name}</div>
                      <div className="text-sm text-gray-500">{eq.serialNumber}</div>
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={getCategoryColor(eq.category)}>{eq.category}</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {eq.department.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {eq.location}
                  </td>
                  <td className="px-6 py-4">
                    {eq.isScrapped ? (
                      <Badge variant="destructive">Scrapped</Badge>
                    ) : (
                      <Badge variant="success">Active</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <SmartButton
                      href={`/maintenance?equipmentId=${eq.id}`}
                      icon={
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        </svg>
                      }
                      label="Requests"
                      count={(eq as any)._count?.maintenanceRequests || 0}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
