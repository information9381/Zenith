export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in-progress' | 'completed';

export interface Task {
  id: string;
  uid: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  dueDate?: any;
  createdAt: any;
  updatedAt: any;
}

export type ViewMode = 'list' | 'dashboard' | 'settings';
export type Theme = 'light' | 'dark' | 'system';
