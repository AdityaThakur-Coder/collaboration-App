import express from 'express';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { logActivity } from '../utils/logger.js';

const router = express.Router();

// Get all projects for user
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    })
    .populate('owner', 'username firstName lastName')
    .populate('members.user', 'username firstName lastName')
    .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new project
router.post('/', async (req, res) => {
  try {
    const { name, description, color, priority, endDate } = req.body;

    const project = new Project({
      name,
      description,
      owner: req.user._id,
      color,
      priority,
      endDate,
      members: [{
        user: req.user._id,
        role: 'owner'
      }]
    });

    await project.save();
    await project.populate('owner', 'username firstName lastName');

    // Log activity
    await logActivity({
      userId: req.user._id,
      action: 'project_created',
      projectId: project._id,
      metadata: { projectName: name }
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single project
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    })
    .populate('owner', 'username firstName lastName')
    .populate('members.user', 'username firstName lastName');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update project
router.put('/:id', async (req, res) => {
  try {
    const { name, description, color, priority, status, endDate } = req.body;

    const project = await Project.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [
          { owner: req.user._id },
          { 'members.user': req.user._id, 'members.role': { $in: ['owner', 'admin'] } }
        ]
      },
      {
        name,
        description,
        color,
        priority,
        status,
        endDate
      },
      { new: true }
    )
    .populate('owner', 'username firstName lastName')
    .populate('members.user', 'username firstName lastName');

    if (!project) {
      return res.status(404).json({ message: 'Project not found or unauthorized' });
    }

    // Log activity
    await logActivity({
      userId: req.user._id,
      action: 'project_updated',
      projectId: project._id,
      metadata: { projectName: name }
    });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete project
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or unauthorized' });
    }

    // Delete all tasks associated with this project
    await Task.deleteMany({ project: req.params.id });

    // Log activity
    await logActivity({
      userId: req.user._id,
      action: 'project_deleted',
      projectId: req.params.id,
      metadata: { projectName: project.name }
    });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;