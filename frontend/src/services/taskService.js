import api from '../api/axios';

const taskService = {
  // Get all tasks with optional filters, sort ordering, and pagination parameters
  getTasks: async (filters = {}, sort = {}, pagination = {}) => {
    const params = {};

    // 1. Map filters
    if (filters.priority && filters.priority !== 'all') {
      params.priority = filters.priority;
    }
    if (filters.completed && filters.completed !== 'all') {
      params.completed = filters.completed; // 'true' or 'false'
    }

    // 2. Map sorting options
    if (sort.sortBy) {
      params.sortBy = sort.sortBy;
      params.sortOrder = sort.sortOrder || 'asc';
    }

    // 3. Map pagination options
    if (pagination.page) {
      params.page = pagination.page;
    }
    if (pagination.limit) {
      params.limit = pagination.limit;
    }

    const response = await api.get('/tasks', { params });
    return response.data; // Expects { success, count, pagination, metadata, data }
  },

  // Get single task by ID
  getTaskById: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  // Create a new task
  createTask: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  // Update an existing task
  updateTask: async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  // Delete a task
  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  }
};

export default taskService;
