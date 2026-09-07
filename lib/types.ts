// File unico per definire tutti i tipi - elimina conflitti di tipo

export interface ITask {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  project: string;
  assignees: string[]; // Array di user IDs (stringhe), NON oggetti
  dueDate?: string;
  startDate?: string;
  labels: string[];
  createdAt: string;
}

export interface IProject {
  _id: string;
  name: string;
  description: string;
  team: string;
  defaultColumns: string[];
  createdAt: string;
}

export interface IUser {
  _id: string;
  email: string;
  name: string;
  password: string;
  team: string;
  createdAt: string;
}

export interface INotification {
  _id: string;
  userId: string;
  message: string;
  taskId?: string;
  read: boolean;
  createdAt: string;
}
