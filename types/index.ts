import { 
  User, 
  Department, 
  Equipment, 
  MaintenanceTeam, 
  MaintenanceRequest, 
  MaintenanceNote,
  Role,
  EquipmentCategory,
  RequestType,
  RequestStage
} from '@prisma/client';

export type { 
  User, 
  Department, 
  Equipment, 
  MaintenanceTeam, 
  MaintenanceRequest, 
  MaintenanceNote 
};

export { Role, EquipmentCategory, RequestType, RequestStage };

export type EquipmentWithRelations = Equipment & {
  department: Department;
  assignedEmployee: User | null;
  maintenanceTeam: MaintenanceTeam;
  maintenanceRequests: MaintenanceRequest[];
};

export type MaintenanceRequestWithRelations = MaintenanceRequest & {
  equipment: Equipment;
  maintenanceTeam: MaintenanceTeam & {
    technicians: User[];
  };
  assignedTechnician: User | null;
  createdBy: User;
  notes: MaintenanceNote[];
};

export type MaintenanceTeamWithRelations = MaintenanceTeam & {
  technicians: User[];
  equipment: Equipment[];
};

export type UserWithRelations = User & {
  department: Department | null;
  maintenanceTeams: MaintenanceTeam[];
};

export interface KanbanColumn {
  id: RequestStage;
  title: string;
  requests: MaintenanceRequestWithRelations[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  request: MaintenanceRequestWithRelations;
}

export interface ReportData {
  label: string;
  value: number;
}
