import React, { useState } from 'react';
import { X } from 'lucide-react';

function CreateProjectModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    priority: 'medium',
    endDate: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Create New Project</h3>
          <button onClick={onClose} className="modal-close">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
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
              <label className="form-label">Color</label>
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="form-input h-10"
              />
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
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProjectModal;