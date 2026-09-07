// In-memory store - non richiede MongoDB
// I dati si resettano al riavvio, ma funziona per il test

interface User {
  _id: string;
  email: string;
  password: string;
  name: string;
  currentTeam: string;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  owner: string;
  team: string;
  createdAt: Date;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  project: string;
  status: string;
  priority: 'low' | 'medium' | 'high';
  assignees: string[];
  labels: string[];
  dueDate?: Date;
  createdAt: Date;
}

interface Notification {
  _id: string;
  userId: string;
  taskId: string;
  message: string;
  type: 'assignment' | 'update' | 'comment';
  read: boolean;
  createdAt: Date;
}

class MemoryStore {
  users: Map<string, User> = new Map();
  projects: Map<string, Project> = new Map();
  tasks: Map<string, Task> = new Map();
  notifications: Map<string, Notification> = new Map();

  // User operations
  findUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  findUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  createUser(user: Omit<User, '_id'>): User {
    const id = Date.now().toString();
    const newUser = { ...user, _id: id };
    this.users.set(id, newUser);
    return newUser;
  }

  // Project operations
  findProjectsByTeam(teamId: string): Project[] {
    return Array.from(this.projects.values()).filter(p => p.team === teamId);
  }

  createProject(project: Omit<Project, '_id' | 'createdAt'>): Project {
    const id = Date.now().toString();
    const newProject = {
      ...project,
      _id: id,
      createdAt: new Date()
    };
    this.projects.set(id, newProject);
    return newProject;
  }

  // Task operations
  findTasksByProject(projectId: string): Task[] {
    return Array.from(this.tasks.values()).filter(t => t.project === projectId);
  }

  createTask(task: Omit<Task, '_id' | 'createdAt'>): Task {
    const id = Date.now().toString();
    const newTask = {
      ...task,
      _id: id,
      createdAt: new Date()
    };
    this.tasks.set(id, newTask);
    return newTask;
  }

  updateTask(id: string, updates: Partial<Task>): Task | undefined {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    const updated = { ...task, ...updates };
    this.tasks.set(id, updated);
    return updated;
  }

  deleteTask(id: string): boolean {
    return this.tasks.delete(id);
  }

  // Team operations
  findTeamMembers(teamId: string): User[] {
    return Array.from(this.users.values()).filter(u => u.currentTeam === teamId);
  }

  // Notification operations
  createNotification(notification: Omit<Notification, '_id' | 'createdAt'>): Notification {
    const id = Date.now().toString() + Math.random();
    const newNotification = {
      ...notification,
      _id: id,
      createdAt: new Date()
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  findNotificationsByUser(userId: string): Notification[] {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  markNotificationAsRead(notificationId: string): Notification | undefined {
    const notification = this.notifications.get(notificationId);
    if (!notification) return undefined;
    const updated = { ...notification, read: true };
    this.notifications.set(notificationId, updated);
    return updated;
  }
}

// Singleton instance
export const memoryStore = new MemoryStore();
