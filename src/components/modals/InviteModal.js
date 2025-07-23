import React, { useState } from 'react';
import { X, Mail } from 'lucide-react';
import api from '../../utils/api';

function InviteModal({ project, onClose }) {
  const [formData, setFormData] = useState({
    email: '',
    role: 'member',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/invites', {
        projectId: project._id,
        ...formData
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error sending invitation:', error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="modal-overlay">
        <div className="modal text-center">
          <div className="mb-4">
            <Mail size={48} className="mx-auto text-green-500 mb-2" />
            <h3 className="text-xl font-semibold text-green-600">
              Invitation Sent!
            </h3>
            <p className="text-gray-600">
              The invitation has been sent to {formData.email}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Invite to {project.name}</h3>
          <button onClick={onClose} className="modal-close">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-select"
            >
              <option value="viewer">Viewer</option>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Personal Message (optional)</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
              placeholder="Add a personal message to the invitation..."
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InviteModal;