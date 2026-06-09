import { useState, useEffect, useContext } from 'react';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import taskService from '../services/taskService';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  // Task list and loading states
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  // Query, filters, and sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ priority: 'all', completed: 'all' });
  const [sort, setSort] = useState({ sortBy: 'createdAt', sortOrder: 'desc' });
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(6); // 6 tasks per page
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    totalTasks: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });

  // Fetch tasks from service
  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await taskService.getTasks(
        filters,
        sort,
        { page, limit }
      );
      if (response.success) {
        setTasks(response.data || []);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks from server.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger task fetch on filter, sort, or pagination changes
  useEffect(() => {
    fetchTasks();
  }, [filters, sort, page]);

  // Flash notification timer helper
  const triggerSuccessFlash = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3500);
  };

  // Toggle complete checkbox handler
  const handleToggleComplete = async (taskId, currentCompletedStatus) => {
    try {
      const response = await taskService.updateTask(taskId, { completed: currentCompletedStatus });
      if (response.success) {
        // Optimistically update status locally or re-fetch
        triggerSuccessFlash('Task status updated.');
        fetchTasks();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task status.');
    }
  };

  // Submit handler (handles both create and edit submissions)
  const handleFormSubmit = async (taskData) => {
    try {
      let response;
      if (taskToEdit) {
        response = await taskService.updateTask(taskToEdit.id, taskData);
        triggerSuccessFlash('Task updated successfully.');
      } else {
        response = await taskService.createTask(taskData);
        triggerSuccessFlash('Task created successfully.');
      }

      if (response.success) {
        setIsFormOpen(false);
        setTaskToEdit(null);
        fetchTasks();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task.');
    }
  };

  // Edit task setup trigger
  const handleEditClick = (task) => {
    setTaskToEdit(task);
    setIsFormOpen(true);
  };

  // Delete task action handler
  const handleDeleteClick = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const response = await taskService.deleteTask(taskId);
        if (response.success) {
          triggerSuccessFlash('Task deleted successfully.');
          
          // Adjust pagination: if we deleted the last item on page > 1, page back
          if (tasks.length === 1 && page > 1) {
            setPage(page - 1);
          } else {
            fetchTasks();
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete task.');
      }
    }
  };

  // Filter handlers
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // Reset to page 1 on filter
  };

  // Sort handlers
  const handleSortChange = (sortByField) => {
    setSort(prev => {
      const isSameField = prev.sortBy === sortByField;
      const nextOrder = isSameField && prev.sortOrder === 'asc' ? 'desc' : 'asc';
      return { sortBy: sortByField, sortOrder: nextOrder };
    });
    setPage(1);
  };

  // Client-side text filter on title and description
  const filteredTasks = tasks.filter(task => {
    const query = searchQuery.toLowerCase();
    const titleMatch = task.title?.toLowerCase().includes(query);
    const descMatch = task.description?.toLowerCase().includes(query);
    return titleMatch || descMatch;
  });

  // Calculate task statistics (simple counts based on raw user scope)
  // Since we paginate, we fetch stats counts from the backend if available, or compute on total page counts.
  // For simplicity, we can display counts based on the active loaded tasks or keep them descriptive.
  // Let's implement statistics to look premium.
  const stats = {
    total: pagination.totalTasks || 0,
    completed: tasks.filter(t => t.completed).length, // simple representation for loaded
    pending: tasks.filter(t => !t.completed).length
  };

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="dashboard-content">
        {/* Banner notifications */}
        {success && <div className="alert alert-success toast">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Dashboard Header Panel */}
        <section className="dashboard-header-panel">
          <div className="welcome-banner">
            <h1>Workspace Dashboard</h1>
            <p>Welcome back! You have <strong>{pagination.totalTasks}</strong> tasks registered in your workspace.</p>
          </div>
          <button className="btn btn-primary btn-add-task" onClick={() => { setTaskToEdit(null); setIsFormOpen(true); }}>
            ➕ Create Task
          </button>
        </section>

        {/* Filters and Controls Area */}
        <section className="controls-panel-glass">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Search title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="filter-group">
            <div className="filter-item">
              <label>Status</label>
              <select
                value={filters.completed}
                onChange={(e) => handleFilterChange('completed', e.target.value)}
                className="form-control"
              >
                <option value="all">All</option>
                <option value="true">Completed</option>
                <option value="false">Active</option>
              </select>
            </div>

            <div className="filter-item">
              <label>Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="form-control"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="sorting-group">
            <label className="sorting-label">Sort by:</label>
            <button
              onClick={() => handleSortChange('createdAt')}
              className={`btn btn-sm btn-sort ${sort.sortBy === 'createdAt' ? 'active' : ''}`}
            >
              Date Created {sort.sortBy === 'createdAt' && (sort.sortOrder === 'asc' ? '▲' : '▼')}
            </button>
            <button
              onClick={() => handleSortChange('dueDate')}
              className={`btn btn-sm btn-sort ${sort.sortBy === 'dueDate' ? 'active' : ''}`}
            >
              Due Date {sort.sortBy === 'dueDate' && (sort.sortOrder === 'asc' ? '▲' : '▼')}
            </button>
            <button
              onClick={() => handleSortChange('priority')}
              className={`btn btn-sm btn-sort ${sort.sortBy === 'priority' ? 'active' : ''}`}
            >
              Priority {sort.sortBy === 'priority' && (sort.sortOrder === 'asc' ? '▲' : '▼')}
            </button>
          </div>
        </section>

        {/* Tasks grid rendering section */}
        {loading ? (
          <div className="loader-container">
            <div className="loader"></div>
            <p>Loading tasks database...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-state-glass">
            <div className="empty-icon">📁</div>
            <h2>No tasks found</h2>
            <p>{searchQuery ? 'No tasks match your search text.' : 'You have no tasks in this view. Create a new task to get started!'}</p>
            {!searchQuery && (
              <button 
                className="btn btn-primary" 
                onClick={() => { setTaskToEdit(null); setIsFormOpen(true); }}
                style={{ marginTop: '16px' }}
              >
                Create First Task
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="tasks-grid">
              {filteredTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={handleToggleComplete}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>

            {/* Pagination Panel */}
            {pagination.totalPages > 1 && (
              <section className="pagination-bar">
                <button
                  className="btn btn-outline btn-sm btn-page"
                  disabled={!pagination.hasPreviousPage}
                  onClick={() => setPage(page - 1)}
                >
                  ◀ Prev
                </button>
                <span className="page-indicator">
                  Page <strong>{pagination.page}</strong> of {pagination.totalPages}
                </span>
                <button
                  className="btn btn-outline btn-sm btn-page"
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage(page + 1)}
                >
                  Next ▶
                </button>
              </section>
            )}
          </>
        )}

        {/* Form Modal overlay drawer */}
        {isFormOpen && (
          <TaskForm
            taskToEdit={taskToEdit}
            onSubmit={handleFormSubmit}
            onClose={() => { setIsFormOpen(false); setTaskToEdit(null); }}
          />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
