import React, { useState } from 'react';
import { X } from 'lucide-react';

function CreateTaskModal({ projectMembers, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: '',
    tags: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const taskData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    onSubmit(taskData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Create New Task</h3>
          <button onClick={onClose} className="modal-close">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Assign To</label>
              <select
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Select member...</option>
                {projectMembers.map((member) => (
                  <option key={member.user._id} value={member.user._id}>
                    {member.user.firstName} {member.user.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="form-select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="form-input"
              placeholder="bug, feature, urgent"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTaskModal;