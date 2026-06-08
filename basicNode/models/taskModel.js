// In-memory array acting as our database storage for Tasks
let tasks = [
  { 
    id: 1, 
    title: 'Learn Node.js', 
    description: 'Understand basic Node.js concepts', 
    completed: true,
    priority: 'medium',
    dueDate: null,
    createdAt: '2026-06-01T10:00:00.000Z'
  },
  { 
    id: 2, 
    title: 'Build an Express API', 
    description: 'Build a RESTful API using Express.js MVC pattern', 
    completed: false,
    priority: 'high',
    dueDate: '2026-06-15T12:00:00.000Z',
    createdAt: '2026-06-02T11:00:00.000Z'
  },
  { 
    id: 3, 
    title: 'Write API Tests', 
    description: 'Implement integration tests with Jest and Supertest', 
    completed: false,
    priority: 'low',
    dueDate: '2026-06-10T09:00:00.000Z',
    createdAt: '2026-06-03T12:00:00.000Z'
  }
];

// Helper to generate a new unique ID
const generateId = () => {
  return tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
};

class TaskModel {
  // Get all tasks with filtering and sorting
  static getAll(filters = {}, sort = {}, pagination = {}) {
    // Create a copy of the tasks array to prevent mutation of the original task order
    let result = [...tasks];

    // 1. Apply filtering BEFORE sorting
    const { priority, completed } = filters;

    if (priority !== undefined) {
      result = result.filter(task => task.priority === priority);
    }

    if (completed !== undefined) {
      result = result.filter(task => task.completed === completed);
    }

    // 2. Apply sorting
    const { sortBy, sortOrder = 'asc' } = sort;

    if (sortBy) {
      const isAsc = sortOrder === 'asc';
      const modifier = isAsc ? 1 : -1;

      result.sort((a, b) => {
        if (sortBy === 'createdAt') {
          if (a.createdAt < b.createdAt) return -1 * modifier;
          if (a.createdAt > b.createdAt) return 1 * modifier;
          return 0;
        }

        if (sortBy === 'dueDate') {
          // Put null dueDates at the end regardless of asc/desc sorting
          if (a.dueDate === null && b.dueDate !== null) return 1;
          if (a.dueDate !== null && b.dueDate === null) return -1;
          if (a.dueDate === null && b.dueDate === null) return 0;

          const dateA = new Date(a.dueDate).getTime();
          const dateB = new Date(b.dueDate).getTime();

          if (dateA < dateB) return -1 * modifier;
          if (dateA > dateB) return 1 * modifier;
          return 0;
        }

        if (sortBy === 'priority') {
          const priorityMap = { low: 1, medium: 2, high: 3 };
          const valA = priorityMap[a.priority] || 2;
          const valB = priorityMap[b.priority] || 2;
          return (valA - valB) * modifier;
        }

        return 0;
      });
    }

    // Capture the total count of filtered & sorted tasks before slicing
    const totalCount = result.length;

    // 3. Apply pagination
    const { page = 1, limit = 5 } = pagination;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTasks = result.slice(startIndex, endIndex);

    return {
      tasks: paginatedTasks,
      totalCount
    };
  }

  // Get task by ID
  static getById(id) {
    return tasks.find(task => task.id === parseInt(id, 10));
  }

  // Create a new task
  static create(title, description, priority, dueDate, completed) {
    const newTask = {
      id: generateId(),
      title,
      description: description || '',
      completed: completed === undefined ? false : completed,
      priority: priority || 'medium',
      dueDate: dueDate || null,
      createdAt: new Date().toISOString()
    };
    tasks.push(newTask);
    return newTask;
  }

  // Update an existing task
  static update(id, updatedData) {
    const taskIndex = tasks.findIndex(task => task.id === parseInt(id, 10));
    if (taskIndex === -1) return null;

    // Destructure to prevent overwriting of immutable properties (id, createdAt)
    const { id: _, createdAt: __, ...sanitizedUpdates } = updatedData;

    // Merge old task data with new updates
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...sanitizedUpdates
    };

    return tasks[taskIndex];
  }

  // Delete a task
  static delete(id) {
    const taskIndex = tasks.findIndex(task => task.id === parseInt(id, 10));
    if (taskIndex === -1) return false;

    tasks.splice(taskIndex, 1);
    return true;
  }
}

module.exports = TaskModel;
