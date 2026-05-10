import { Response } from 'express';
import Project from '../models/Project';
import { AuthRequest } from '../middleware/authMiddleware';
import mongoose from 'mongoose';

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        projects: [
          { _id: 'p1', title: 'Task UI Design', description: 'Dashboard design project', createdBy: { name: 'Admin' }, members: [] },
          { _id: 'p2', title: 'Backend API Integration', description: 'Node.js architecture', createdBy: { name: 'Admin' }, members: [] }
        ]
      });
    }

    const userId = req.user?.id;
    const query: any = {};
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.$or = [
        { createdBy: userId },
        { members: userId }
      ];
    }

    const projects = await Project.find(query)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');
    
    res.json({ success: true, projects: projects || [] });
  } catch (err: any) {
    console.error("Get Projects Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(201).json({ success: true, project: { _id: Date.now().toString(), ...req.body } });
    }
    const { title, description, members } = req.body;

    const userId = req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid User ID for database' });
    }
    
    const project = new Project({
      title,
      description,
      createdBy: userId,
      members: members || []
    });

    await project.save();
    res.status(201).json({ success: true, project });
  } catch (err: any) {
    console.error("Create Project Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, project: { _id: req.params.id, ...req.body } });
    }
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    // Only creator or admin can update
    if (project.createdBy.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, project: updatedProject });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, message: 'Project removed (demo)' });
    }
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    if (project.createdBy.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await project.deleteOne();
    res.json({ success: true, message: 'Project removed' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
