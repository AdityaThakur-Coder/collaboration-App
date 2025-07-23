import express from 'express';
import crypto from 'crypto';
import Invite from '../models/Invite.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { sendInviteEmail } from '../utils/email.js';
import { logActivity } from '../utils/logger.js';

const router = express.Router();

// Send invitation
router.post('/', async (req, res) => {
  try {
    const { projectId, email, role, message } = req.body;

    // Check if user has permission to invite
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id, 'members.role': { $in: ['owner', 'admin'] } }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or unauthorized' });
    }

    // Check if user is already a member
    const existingMember = project.members.find(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (existingMember) {
      return res.status(400).json({ message: 'User is already a member of this project' });
    }

    // Check if there's already a pending invite
    const existingInvite = await Invite.findOne({
      project: projectId,
      email,
      status: 'pending'
    });

    if (existingInvite) {
      return res.status(400).json({ message: 'Invitation already sent to this email' });
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');

    // Create invite
    const invite = new Invite({
      project: projectId,
      invitedBy: req.user._id,
      email,
      role,
      message,
      token
    });

    await invite.save();

    // Send email
    await sendInviteEmail({
      email,
      projectName: project.name,
      inviterName: `${req.user.firstName} ${req.user.lastName}`,
      token,
      message
    });

    // Log activity
    await logActivity({
      userId: req.user._id,
      action: 'invite_sent',
      projectId,
      metadata: { invitedEmail: email, role }
    });

    res.status(201).json({ message: 'Invitation sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Accept invitation
router.post('/accept/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const invite = await Invite.findOne({
      token,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    }).populate('project');

    if (!invite) {
      return res.status(404).json({ message: 'Invalid or expired invitation' });
    }

    // Check if user email matches invite email
    if (req.user.email !== invite.email) {
      return res.status(400).json({ message: 'This invitation is not for your email address' });
    }

    // Add user to project
    const project = await Project.findById(invite.project._id);
    project.members.push({
      user: req.user._id,
      role: invite.role
    });

    await project.save();

    // Update invite status
    invite.status = 'accepted';
    await invite.save();

    // Log activity
    await logActivity({
      userId: req.user._id,
      action: 'invite_accepted',
      projectId: invite.project._id,
      metadata: { role: invite.role }
    });

    res.json({ message: 'Invitation accepted successfully', project });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get pending invitations for user
router.get('/pending', async (req, res) => {
  try {
    const invites = await Invite.find({
      email: req.user.email,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    })
    .populate('project', 'name description')
    .populate('invitedBy', 'firstName lastName username');

    res.json(invites);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;