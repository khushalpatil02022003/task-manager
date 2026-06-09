import React from 'react';

const TaskCard = ({ task, onToggleComplete, onEdit, onDelete }) => {
  const { id, title, description, completed, priority, dueDate } = task;

  // Format date nicely
  const formatDueDate = (dateStr) => {
    if (!dateStr) return 'No due date';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Check if task is overdue
  const isOverdue = dueDate && new Date(dueDate) < new Date() && !completed;

  return (
    <div className={`task-card ${completed ? 'completed' : ''}`}>
      <div className="task-card-header">
        <label className="checkbox-container">
          <input
            type="checkbox"
            checked={completed}
            onChange={() => onToggleComplete(id, !completed)}
          />
          <span className="checkmark"></span>
        </label>
        
        <h3 className="task-title" title={title}>
          {title}
        </h3>
        
        <span className={`priority-badge priority-${priority}`}>
          {priority}
        </span>
      </div>

      <div className="task-card-body">
        <p className="task-description">
          {description || <span className="empty-text">No description provided.</span>}
        </p>
      </div>

      <div className="task-card-footer">
        <div className={`task-due-date ${isOverdue ? 'overdue' : ''}`}>
          📅 {formatDueDate(dueDate)} {isOverdue && <span className="overdue-tag">(Overdue)</span>}
        </div>
        
        <div className="task-actions">
          <button 
            className="btn btn-icon btn-edit" 
            onClick={() => onEdit(task)} 
            title="Edit Task"
          >
            ✏️
          </button>
          <button 
            className="btn btn-icon btn-delete" 
            onClick={() => onDelete(id)} 
            title="Delete Task"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
