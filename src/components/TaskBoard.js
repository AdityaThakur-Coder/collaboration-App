import React from 'react';
import { Calendar, User, MessageCircle } from 'lucide-react';

function TaskBoard({ tasks, onStatusChange, projectMembers }) {
  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-100' },
    { id: 'review', title: 'Review', color: 'bg-yellow-100' },
    { id: 'completed', title: 'Completed', color: 'bg-green-100' }
  ];

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('task', JSON.stringify(task));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const task = JSON.parse(e.dataTransfer.getData('task'));
    if (task.status !== newStatus) {
      onStatusChange(task._id, newStatus);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((column) => (
        <div
          key={column.id}
          className={`${column.color} p-4 rounded-lg min-h-96`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          <h4 className="font-semibold mb-4 text-center">
            {column.title}
            <span className="ml-2 text-sm text-gray-500">
              ({getTasksByStatus(column.id).length})
            </span>
          </h4>

          <div className="space-y-3">
            {getTasksByStatus(column.id).map((task) => (
              <div
                key={task._id}
                className={`bg-white p-3 rounded-lg shadow-sm border-l-4 ${getPriorityColor(task.priority)} cursor-move hover:shadow-md transition-shadow`}
                draggable
                onDragStart={(e) => handleDragStart(e, task)}
              >
                <h5 className="font-medium mb-2">{task.title}</h5>
                
                {task.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {task.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span className={`badge badge-${task.priority}`}>
                    {task.priority}
                  </span>
                  
                  {task.dueDate && (
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <User size={12} />
                    <span className="text-xs">
                      {task.assignedTo 
                        ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
                        : 'Unassigned'
                      }
                    </span>
                  </div>
                  
                  {task.comments && task.comments.length > 0 && (
                    <div className="flex items-center gap-1">
                      <MessageCircle size={12} />
                      <span className="text-xs">{task.comments.length}</span>
                    </div>
                  )}
                </div>

                {task.tags && task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TaskBoard;