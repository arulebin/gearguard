import prisma from './prisma';
import { User } from '@prisma/client';

// For demo purposes, we'll use a simple session simulation
// In production, use NextAuth.js or similar

export async function getCurrentUser(): Promise<User | null> {
  // Get the first manager for demo purposes
  // In production, this would read from session/JWT
  const user = await prisma.user.findFirst({
    where: { role: 'MANAGER' },
  });
  return user;
}

export async function getUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export function canAssignRequest(userRole: string, teamTechnicianIds: string[], userId: string): boolean {
  return userRole === 'TECHNICIAN' && teamTechnicianIds.includes(userId);
}

export function canMarkRepaired(userRole: string, assignedTechnicianId: string | null, userId: string): boolean {
  return userRole === 'TECHNICIAN' && assignedTechnicianId === userId;
}

export function canCreatePreventive(userRole: string): boolean {
  return userRole === 'MANAGER';
}
