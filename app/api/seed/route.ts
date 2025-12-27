import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    // Clear existing data
    await prisma.maintenanceNote.deleteMany();
    await prisma.maintenanceRequest.deleteMany();
    await prisma.equipment.deleteMany();
    await prisma.maintenanceTeam.deleteMany();
    await prisma.user.deleteMany();
    await prisma.department.deleteMany();

    // Create departments
    const departments = await Promise.all([
      prisma.department.create({ data: { name: 'Production' } }),
      prisma.department.create({ data: { name: 'Logistics' } }),
      prisma.department.create({ data: { name: 'IT Department' } }),
      prisma.department.create({ data: { name: 'Administration' } }),
    ]);

    // Create users
    const users = await Promise.all([
      prisma.user.create({
        data: {
          name: 'John Manager',
          email: 'john.manager@gearguard.com',
          role: 'MANAGER',
          departmentId: departments[0].id,
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        },
      }),
      prisma.user.create({
        data: {
          name: 'Sarah Technician',
          email: 'sarah.tech@gearguard.com',
          role: 'TECHNICIAN',
          departmentId: departments[0].id,
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        },
      }),
      prisma.user.create({
        data: {
          name: 'Mike Technician',
          email: 'mike.tech@gearguard.com',
          role: 'TECHNICIAN',
          departmentId: departments[1].id,
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
        },
      }),
      prisma.user.create({
        data: {
          name: 'Emily IT Tech',
          email: 'emily.it@gearguard.com',
          role: 'TECHNICIAN',
          departmentId: departments[2].id,
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
        },
      }),
      prisma.user.create({
        data: {
          name: 'David Employee',
          email: 'david.emp@gearguard.com',
          role: 'EMPLOYEE',
          departmentId: departments[0].id,
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
        },
      }),
      prisma.user.create({
        data: {
          name: 'Lisa Employee',
          email: 'lisa.emp@gearguard.com',
          role: 'EMPLOYEE',
          departmentId: departments[1].id,
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
        },
      }),
    ]);

    // Create maintenance teams
    const teams = await Promise.all([
      prisma.maintenanceTeam.create({
        data: {
          name: 'Machine Specialists',
          specialization: 'Industrial machinery and production equipment',
          technicians: {
            connect: [{ id: users[1].id }],
          },
        },
      }),
      prisma.maintenanceTeam.create({
        data: {
          name: 'Vehicle Fleet Team',
          specialization: 'Company vehicles and transport equipment',
          technicians: {
            connect: [{ id: users[2].id }],
          },
        },
      }),
      prisma.maintenanceTeam.create({
        data: {
          name: 'IT Support',
          specialization: 'Computers, servers, and network equipment',
          technicians: {
            connect: [{ id: users[3].id }],
          },
        },
      }),
    ]);

    // Create equipment
    const equipment = await Promise.all([
      prisma.equipment.create({
        data: {
          name: 'CNC Milling Machine',
          serialNumber: 'CNC-2024-001',
          category: 'MACHINE',
          departmentId: departments[0].id,
          assignedEmployeeId: users[4].id,
          location: 'Production Hall A',
          purchaseDate: new Date('2022-03-15'),
          warrantyEndDate: new Date('2025-03-15'),
          maintenanceTeamId: teams[0].id,
        },
      }),
      prisma.equipment.create({
        data: {
          name: 'Hydraulic Press',
          serialNumber: 'HP-2023-042',
          category: 'MACHINE',
          departmentId: departments[0].id,
          location: 'Production Hall B',
          purchaseDate: new Date('2023-01-20'),
          warrantyEndDate: new Date('2026-01-20'),
          maintenanceTeamId: teams[0].id,
        },
      }),
      prisma.equipment.create({
        data: {
          name: 'Delivery Truck #1',
          serialNumber: 'VEH-2021-101',
          category: 'VEHICLE',
          departmentId: departments[1].id,
          assignedEmployeeId: users[5].id,
          location: 'Parking Lot',
          purchaseDate: new Date('2021-06-10'),
          warrantyEndDate: new Date('2024-06-10'),
          maintenanceTeamId: teams[1].id,
        },
      }),
      prisma.equipment.create({
        data: {
          name: 'Forklift #3',
          serialNumber: 'VEH-2022-203',
          category: 'VEHICLE',
          departmentId: departments[1].id,
          location: 'Warehouse',
          purchaseDate: new Date('2022-09-05'),
          warrantyEndDate: new Date('2025-09-05'),
          maintenanceTeamId: teams[1].id,
        },
      }),
      prisma.equipment.create({
        data: {
          name: 'Main Server',
          serialNumber: 'IT-2023-SRV-001',
          category: 'IT',
          departmentId: departments[2].id,
          location: 'Server Room',
          purchaseDate: new Date('2023-08-01'),
          warrantyEndDate: new Date('2026-08-01'),
          maintenanceTeamId: teams[2].id,
        },
      }),
      prisma.equipment.create({
        data: {
          name: 'Workstation PC #15',
          serialNumber: 'IT-2024-WS-015',
          category: 'IT',
          departmentId: departments[3].id,
          location: 'Office 201',
          purchaseDate: new Date('2024-01-15'),
          warrantyEndDate: new Date('2027-01-15'),
          maintenanceTeamId: teams[2].id,
        },
      }),
    ]);

    // Create maintenance requests
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    await Promise.all([
      // NEW requests
      prisma.maintenanceRequest.create({
        data: {
          subject: 'Unusual vibration during operation',
          requestType: 'CORRECTIVE',
          equipmentId: equipment[0].id,
          maintenanceTeamId: teams[0].id,
          createdById: users[4].id,
          stage: 'NEW',
          description: 'The CNC machine is making unusual vibrations when running at high speeds.',
        },
      }),
      prisma.maintenanceRequest.create({
        data: {
          subject: 'Oil leak detected',
          requestType: 'CORRECTIVE',
          equipmentId: equipment[1].id,
          maintenanceTeamId: teams[0].id,
          createdById: users[4].id,
          stage: 'NEW',
          description: 'Small oil leak found near the hydraulic system.',
        },
      }),

      // IN_PROGRESS requests
      prisma.maintenanceRequest.create({
        data: {
          subject: 'Brake inspection required',
          requestType: 'CORRECTIVE',
          equipmentId: equipment[2].id,
          maintenanceTeamId: teams[1].id,
          assignedTechnicianId: users[2].id,
          createdById: users[5].id,
          stage: 'IN_PROGRESS',
          description: 'Driver reported squeaking brakes during stops.',
        },
      }),
      prisma.maintenanceRequest.create({
        data: {
          subject: 'Server performance degradation',
          requestType: 'CORRECTIVE',
          equipmentId: equipment[4].id,
          maintenanceTeamId: teams[2].id,
          assignedTechnicianId: users[3].id,
          createdById: users[0].id,
          stage: 'IN_PROGRESS',
          description: 'Server response times have increased significantly.',
        },
      }),

      // REPAIRED requests
      prisma.maintenanceRequest.create({
        data: {
          subject: 'Replace worn tires',
          requestType: 'PREVENTIVE',
          equipmentId: equipment[3].id,
          maintenanceTeamId: teams[1].id,
          assignedTechnicianId: users[2].id,
          createdById: users[0].id,
          stage: 'REPAIRED',
          durationHours: 2.5,
          scheduledDate: yesterday,
          description: 'Scheduled tire replacement for forklift.',
        },
      }),

      // Preventive (scheduled) requests
      prisma.maintenanceRequest.create({
        data: {
          subject: 'Monthly CNC calibration',
          requestType: 'PREVENTIVE',
          equipmentId: equipment[0].id,
          maintenanceTeamId: teams[0].id,
          createdById: users[0].id,
          stage: 'NEW',
          scheduledDate: tomorrow,
          description: 'Routine monthly calibration check.',
        },
      }),
      prisma.maintenanceRequest.create({
        data: {
          subject: 'Quarterly server backup verification',
          requestType: 'PREVENTIVE',
          equipmentId: equipment[4].id,
          maintenanceTeamId: teams[2].id,
          createdById: users[0].id,
          stage: 'NEW',
          scheduledDate: nextWeek,
          description: 'Verify backup integrity and test restoration procedures.',
        },
      }),

      // Overdue request
      prisma.maintenanceRequest.create({
        data: {
          subject: 'Annual safety inspection',
          requestType: 'PREVENTIVE',
          equipmentId: equipment[1].id,
          maintenanceTeamId: teams[0].id,
          createdById: users[0].id,
          stage: 'NEW',
          scheduledDate: yesterday,
          description: 'Annual safety inspection - OVERDUE!',
        },
      }),
    ]);

    return NextResponse.json({ message: 'Database seeded successfully!' });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
