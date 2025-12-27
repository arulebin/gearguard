'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Equipment, MaintenanceTeam, RequestType } from '@/types';
import { getCategoryColor } from '@/lib/utils';

interface CreateRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUserId: string;
  currentUserRole: string;
  defaultType?: RequestType;
  defaultDate?: string;
}

export function CreateRequestForm({
  isOpen,
  onClose,
  onSuccess,
  currentUserId,
  currentUserRole,
  defaultType = 'CORRECTIVE',
  defaultDate,
}: CreateRequestFormProps) {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    subject: '',
    requestType: defaultType,
    equipmentId: '',
    scheduledDate: defaultDate || '',
    description: '',
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  useEffect(() => {
    if (defaultType) {
      setFormData(prev => ({ ...prev, requestType: defaultType }));
    }
    if (defaultDate) {
      setFormData(prev => ({ ...prev, scheduledDate: defaultDate }));
    }
  }, [defaultType, defaultDate]);

  const fetchEquipment = async () => {
    try {
      const response = await fetch('/api/equipment');
      if (response.ok) {
        const data = await response.json();
        setEquipment(data);
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  const handleEquipmentChange = (equipmentId: string) => {
    const eq = equipment.find(e => e.id === equipmentId);
    setSelectedEquipment(eq || null);
    setFormData(prev => ({ ...prev, equipmentId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.requestType === 'PREVENTIVE' && currentUserRole !== 'MANAGER') {
      alert('Only managers can create preventive maintenance requests');
      return;
    }

    if (formData.requestType === 'PREVENTIVE' && !formData.scheduledDate) {
      alert('Scheduled date is required for preventive maintenance');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          createdById: currentUserId,
        }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
        setFormData({
          subject: '',
          requestType: 'CORRECTIVE',
          equipmentId: '',
          scheduledDate: '',
          description: '',
        });
        setSelectedEquipment(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create request');
      }
    } catch (error) {
      console.error('Error creating request:', error);
    }
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Maintenance Request" className="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <Input
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="Enter request subject"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
          <Select
            value={formData.requestType}
            onChange={(e) => setFormData(prev => ({ ...prev, requestType: e.target.value as RequestType }))}
            disabled={currentUserRole !== 'MANAGER' && formData.requestType === 'PREVENTIVE'}
          >
            <option value="CORRECTIVE">Corrective (Breakdown)</option>
            {currentUserRole === 'MANAGER' && (
              <option value="PREVENTIVE">Preventive (Scheduled)</option>
            )}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
          <Select
            value={formData.equipmentId}
            onChange={(e) => handleEquipmentChange(e.target.value)}
            required
          >
            <option value="">Select equipment</option>
            {equipment.map(eq => (
              <option key={eq.id} value={eq.id}>
                {eq.name} ({eq.serialNumber})
              </option>
            ))}
          </Select>
        </div>

        {/* Auto-filled equipment info */}
        {selectedEquipment && (
          <div className="rounded-lg bg-gray-50 p-4 space-y-2">
            <p className="text-sm font-medium text-gray-700">Equipment Details (Auto-filled)</p>
            <div className="flex flex-wrap gap-2">
              <Badge className={getCategoryColor(selectedEquipment.category)}>
                {selectedEquipment.category}
              </Badge>
              <Badge variant="outline">
                Team: {(selectedEquipment as any).maintenanceTeam?.name || 'Loading...'}
              </Badge>
              <Badge variant="outline">
                Location: {selectedEquipment.location}
              </Badge>
            </div>
          </div>
        )}

        {formData.requestType === 'PREVENTIVE' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scheduled Date <span className="text-red-500">*</span>
            </label>
            <Input
              type="datetime-local"
              value={formData.scheduledDate}
              onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
              required={formData.requestType === 'PREVENTIVE'}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the issue or maintenance needed"
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Request'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
