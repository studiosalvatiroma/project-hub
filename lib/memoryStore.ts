import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in .env.local');
}

// Connect to MongoDB
let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Define schemas
const userSchema = new mongoose.Schema({
  _id: String,
  email: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  team: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const projectSchema = new mongoose.Schema({
  _id: String,
  name: { type: String, required: true },
  description: String,
  team: { type: String, required: true },
  defaultColumns: [String],
  createdAt: { type: Date, default: Date.now },
});

const taskSchema = new mongoose.Schema({
  _id: String,
  title: { type: String, required: true },
  description: String,
  status: { type: String, default: 'To Do' },
  priority: { type: String, default: 'medium' },
  project: { type: String, required: true },
  assignees: [String],
  dueDate: String,
  startDate: String,
  labels: [String],
  createdAt: { type: Date, default: Date.now },
});

const notificationSchema = new mongoose.Schema({
  _id: String,
  userId: { type: String, required: true },
  message: { type: String, required: true },
  taskId: String,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Create models
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);
const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);
const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

// MemoryStore class that uses MongoDB
export class MemoryStore {
  async initialize() {
    await connectDB();
  }

  async findUserByEmail(email: string) {
    await connectDB();
    return await User.findOne({ email });
  }

  async findUserById(id: string) {
    await connectDB();
    return await User.findById(id);
  }

  async createUser(userData: {
    email: string;
    name: string;
    password: string;
    team: string;
  }) {
    await connectDB();
    const id = Date.now().toString();
    const user = new User({
      _id: id,
      ...userData,
    });
    await user.save();
    return user;
  }

  async findProjectsByTeam(team: string) {
    await connectDB();
    return await Project.find({ team });
  }

  async createProject(projectData: {
    name: string;
    description: string;
    team: string;
    defaultColumns: string[];
  }) {
    await connectDB();
    const id = Date.now().toString();
    const project = new Project({
      _id: id,
      ...projectData,
    });
    await project.save();
    return project;
  }

  async findTasksByProject(projectId: string) {
    await connectDB();
    return await Task.find({ project: projectId });
  }

  async findTaskById(id: string) {
    await connectDB();
    return await Task.findById(id);
  }

  async createTask(taskData: {
    title: string;
    description: string;
    project: string;
    priority: string;
    assignees: string[];
    labels: string[];
    dueDate?: string;
  }) {
    await connectDB();
    const id = Date.now().toString();
    const task = new Task({
      _id: id,
      ...taskData,
    });
    await task.save();
    return task;
  }

  async updateTask(
    id: string,
    updates: {
      status?: string;
      assignees?: string[];
      priority?: string;
      description?: string;
      dueDate?: string;
    }
  ) {
    await connectDB();
    return await Task.findByIdAndUpdate(id, updates, { new: true });
  }

  async deleteTask(id: string) {
    await connectDB();
    await Task.findByIdAndDelete(id);
  }

  async findTeamMembers(team: string) {
    await connectDB();
    return await User.find({ team }).select('_id name email');
  }

  async createNotification(notificationData: {
    userId: string;
    message: string;
    taskId: string;
  }) {
    await connectDB();
    const id = Date.now().toString();
    const notification = new Notification({
      _id: id,
      ...notificationData,
    });
    await notification.save();
    return notification;
  }

  async findNotificationsByUser(userId: string) {
    await connectDB();
    return await Notification.find({ userId }).sort({ createdAt: -1 });
  }

  async markNotificationAsRead(id: string) {
    await connectDB();
    return await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
  }
}

export const memoryStore = new MemoryStore();
