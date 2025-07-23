import express from 'express';
import { getActivityLogs } from '../utils/logger.js';

const router = express.Router();

// Get activity logs for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const logs = await getActivityLogs(projectId, parseInt(limit), parseInt(offset));
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;