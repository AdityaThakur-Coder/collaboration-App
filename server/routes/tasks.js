import express from 'express';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { logActivity } from '../utils/logger.js';

const router = express.Router();

// Get tasks for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Check if user has access to the project
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const tasks = await Task.find({ project: projectId })
      .populate('assignedTo', 'username firstName lastName')
      .populate('createdBy', 'username firstName lastName')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new task
router.post('/', async (req, res) => {
  try {
    const { title, description, project, assignedTo, priority, dueDate, tags } = req.body;

    // Check if user has access to the project
    const projectDoc = await Project.findOne({
      _id: project,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    });

    if (!projectDoc) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = new Task({
      title,
      description,
      project,
      assignedTo,
      createdBy: req.user._id,
      priority,
      dueDate,
      tags
    });

    await task.save();
    await task.populate('assignedTo', 'username firstName lastName');
    await task.populate('createdBy', 'username firstName lastName');

    // Log activity
    await logActivity({
      userId: req.user._id,
      action: 'task_created',
      projectId: project,
      metadata: { taskTitle: title }
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update task
router.put('/:id', async (req, res) => {
  try {
    const { title, description, status, priority, assignedTo, dueDate, tags } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to the project
    const project = await Project.findOne({
      _id: task.project,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        status,
        priority,
        assignedTo,
        dueDate,
        tags
      },
      { new: true }
    )
    .populate('assignedTo', 'username firstName lastName')
    .populate('createdBy', 'username firstName lastName');

    // Log activity
    await logActivity({
      userId: req.user._id,
      action: 'task_updated',
      projectId: task.project,
      metadata: { taskTitle: title, status }
    });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to the project
    const project = await Project.findOne({
      _id: task.project,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await Task.findByIdAndDelete(req.params.id);

    // Log activity
    await logActivity({
      userId: req.user._id,
      action: 'task_deleted',
      projectId: task.project,
      metadata: { taskTitle: task.title }
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add comment to task
router.post('/:id/comments', async (req, res) => {
  try {
    const { text } = req.body;
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.comments.push({
      user: req.user._id,
      text,
      createdAt: new Date()
    });

    await task.save();
    await task.populate('comments.user', 'username firstName lastName');

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;