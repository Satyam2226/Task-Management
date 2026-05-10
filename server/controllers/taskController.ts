import { Response } from 'express';
import Task from '../models/Task';
import Project from '../models/Project';
import { AuthRequest } from '../middleware/authMiddleware';
import mongoose from 'mongoose';

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.query;
    
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        tasks: [
          { _id: 't1', title: 'Setup Project Structure', description: 'Create initial folders and config', status: 'completed', priority: 'high', deadline: new Date().toISOString(), assignedTo: { name: 'Me' } },
          { _id: 't2', title: 'Design Figma Mockups', description: 'Create high-fidelity designs', status: 'in-progress', priority: 'medium', deadline: new Date().toISOString(), assignedTo: { name: 'Me' } },
          { _id: 't3', title: 'API Integration', description: 'Connect frontend with backend', status: 'todo', priority: 'high', deadline: new Date().toISOString(), assignedTo: { name: 'Me' } }
        ]
      });
    }

    const query: any = {};
    if (projectId && mongoose.Types.ObjectId.isValid(projectId as string)) {
      query.projectId = projectId;
    }
    
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatar')
      .populate('projectId', 'title');
      
    res.json({ success: true, tasks: tasks || [] });
  } catch (err: any) {
    console.error("Get Tasks Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const demoTask = { 
        _id: `t-${Date.now()}`, 
        ...req.body,
        projectId: req.body.projectId || 'p1',
        createdAt: new Date().toISOString(),
        assignedTo: req.body.assignedTo?.name ? req.body.assignedTo : { name: 'Unassigned' }
      };
      return res.status(201).json({ success: true, task: demoTask });
    }
    
    let projectId = req.body.projectId;
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      // Find or create fallback project
      const fallback = await Project.findOne();
      if (fallback) {
        projectId = fallback._id;
      } else {
        const userId = mongoose.Types.ObjectId.isValid(req.user?.id as string) ? req.user?.id : undefined;
        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
        
        const newProj = new Project({
          title: 'Project Portfolio',
          description: 'Default Team Workspace',
          createdBy: userId
        });
        await newProj.save();
        projectId = newProj._id;
      }
    }

    // Sanitize assignedTo
    const taskData = { ...req.body, projectId };
    if (taskData.assignedTo && typeof taskData.assignedTo === 'object' && !mongoose.Types.ObjectId.isValid(taskData.assignedTo._id)) {
      delete taskData.assignedTo;
    }

    const task = new Task({
      ...taskData,
      createdBy: mongoose.Types.ObjectId.isValid(req.user?.id as string) ? req.user?.id : undefined
    });

    // Fallback createdBy if still missing (should not happen if logged in properly)
    if (!task.createdBy && mongoose.connection.readyState === 1) {
       // In real mode we need a real ID. If we don't have one, we might have to use a system user or fail
       // But usually req.user.id is set by middleware. If it's 'demo-user', it fails.
       return res.status(400).json({ success: false, message: 'Invalid User ID for database' });
    }

    await task.save();
    
    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (task.projectId) {
      io.to(task.projectId.toString()).emit('task-created', task);
    }

    res.status(201).json({ success: true, task });
  } catch (err: any) {
    console.error("Create Task Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, task: { _id: req.params.id, ...req.body } });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Task ID' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    // Sanitize assignedTo
    const updateData = { ...req.body };
    if (updateData.assignedTo && typeof updateData.assignedTo === 'object' && !mongoose.Types.ObjectId.isValid(updateData.assignedTo._id)) {
      delete updateData.assignedTo;
    }
    
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('assignedTo', 'name email avatar');

    const io = req.app.get('io');
    if (task.projectId) {
      io.to(task.projectId.toString()).emit('task-updated', updatedTask);
    }

    res.json({ success: true, task: updatedTask });
  } catch (err: any) {
    console.error("Update Task Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, message: 'Task removed (demo)' });
    }
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    await task.deleteOne();
    
    const io = req.app.get('io');
    io.to(task.projectId.toString()).emit('task-deleted', req.params.id);

    res.json({ success: true, message: 'Task removed' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
