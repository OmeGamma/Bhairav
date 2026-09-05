import { simulateApiCall } from './apiClient';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string;
  assignedBy: string;
  dueDate: string;
  linkedModule?: string;
  linkedId?: string;
}

const mockTasks: Task[] = [
  {
    id: 'TSK-001',
    title: 'Review restricted zone event BH-104',
    description: 'Analyze camera footage and verify personnel identities for the restricted zone breach attempt.',
    status: 'in_progress',
    priority: 'critical',
    assignedTo: 'Officer Sharma',
    assignedBy: 'Command Center',
    dueDate: new Date(Date.now() + 3600000).toISOString(),
    linkedModule: 'Security Events',
    linkedId: 'BH-104',
  },
  {
    id: 'TSK-002',
    title: 'Complete identity verification for POI-8821',
    description: 'Cross-reference document with national database and update verification status.',
    status: 'not_started',
    priority: 'high',
    assignedTo: 'Officer Sharma',
    assignedBy: 'Verification Unit',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    linkedModule: 'Verification',
    linkedId: 'POI-8821',
  },
  {
    id: 'TSK-003',
    title: 'Network analysis: link POI-8821 to incident cluster',
    description: 'Map relationships between POI-8821 and recent security incidents in Sector X.',
    status: 'overdue',
    priority: 'high',
    assignedTo: 'Officer Sharma',
    assignedBy: 'Network Intelligence',
    dueDate: new Date(Date.now() - 86400000).toISOString(),
    linkedModule: 'Network Intelligence',
    linkedId: 'NET-445',
  },
  {
    id: 'TSK-004',
    title: 'Personnel welfare check-in: Team Alpha',
    description: 'Conduct scheduled welfare check-in for personnel deployed in Sector X.',
    status: 'completed',
    priority: 'medium',
    assignedTo: 'Officer Sharma',
    assignedBy: 'Personnel Welfare',
    dueDate: new Date(Date.now() - 172800000).toISOString(),
    linkedModule: 'Personnel',
    linkedId: 'PERS-112',
  },
];

export const taskService = {
  getTasks: async (): Promise<Task[]> => {
    return simulateApiCall(mockTasks, 600);
  },
  
  getTaskById: async (id: string): Promise<Task> => {
    const task = mockTasks.find(t => t.id === id);
    if (!task) throw new Error('Task not found');
    return simulateApiCall(task, 400);
  },
};
