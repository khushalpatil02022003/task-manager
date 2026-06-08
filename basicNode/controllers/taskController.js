const TaskModel = require('../models/taskModel');

class TaskController {
  // GET /api/tasks
  static getAllTasks(req, res) {
    try {
      const { priority, completed, sortBy, sortOrder, page, limit } = req.query;

      const filters = {};
      const appliedFilters = {};

      // Validate and parse 'priority'
      if (priority !== undefined) {
        if (!['low', 'medium', 'high'].includes(priority)) {
          return res.status(400).json({
            success: false,
            message: "Query parameter priority must be 'low', 'medium', or 'high'"
          });
        }
        filters.priority = priority;
        appliedFilters.priority = priority;
      }

      // Validate and parse 'completed'
      if (completed !== undefined) {
        if (completed === 'true') {
          filters.completed = true;
          appliedFilters.completed = true;
        } else if (completed === 'false') {
          filters.completed = false;
          appliedFilters.completed = false;
        } else {
          return res.status(400).json({
            success: false,
            message: "Query parameter completed must be 'true' or 'false'"
          });
        }
      }

      // Validate and parse 'sortBy'
      const sort = {};
      const appliedSort = {};
      if (sortBy !== undefined) {
        if (!['createdAt', 'dueDate', 'priority'].includes(sortBy)) {
          return res.status(400).json({
            success: false,
            message: "Query parameter sortBy must be 'createdAt', 'dueDate', or 'priority'"
          });
        }
        sort.sortBy = sortBy;
        appliedSort.sortBy = sortBy;
      }

      // Validate and parse 'sortOrder'
      if (sortOrder !== undefined) {
        if (!['asc', 'desc'].includes(sortOrder)) {
          return res.status(400).json({
            success: false,
            message: "Query parameter sortOrder must be 'asc' or 'desc'"
          });
        }
        sort.sortOrder = sortOrder;
        appliedSort.sortOrder = sortOrder;
      } else if (sortBy !== undefined) {
        // If sortBy is provided but no sortOrder, it defaults to asc
        appliedSort.sortOrder = 'asc';
      }

      // Validate and parse 'page'
      let pageNum = 1;
      if (page !== undefined) {
        const parsedPage = Number(page);
        if (!Number.isInteger(parsedPage) || parsedPage <= 0) {
          return res.status(400).json({
            success: false,
            message: "Query parameter page must be a positive integer"
          });
        }
        pageNum = parsedPage;
      }

      // Validate and parse 'limit'
      let limitNum = 5;
      if (limit !== undefined) {
        const parsedLimit = Number(limit);
        if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
          return res.status(400).json({
            success: false,
            message: "Query parameter limit must be a positive integer"
          });
        }
        limitNum = parsedLimit;
      }

      const { tasks, totalCount } = TaskModel.getAll(filters, sort, { page: pageNum, limit: limitNum });

      const totalPages = totalCount > 0 ? Math.ceil(totalCount / limitNum) : 0;
      const hasNextPage = pageNum < totalPages;
      const hasPreviousPage = pageNum > 1 && totalPages > 0;

      return res.status(200).json({
        success: true,
        count: tasks.length,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalTasks: totalCount,
          totalPages,
          returnedCount: tasks.length,
          hasNextPage,
          hasPreviousPage
        },
        metadata: {
          appliedFilters,
          appliedSort
        },
        data: tasks
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Server Error fetching tasks'
      });
    }
  }

  // GET /api/tasks/:id
  static getTaskById(req, res) {
    try {
      const task = TaskModel.getById(req.params.id);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: `Task with id ${req.params.id} not found`
        });
      }
      return res.status(200).json({
        success: true,
        data: task
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Server Error fetching task'
      });
    }
  }

  // POST /api/tasks
  static createTask(req, res) {
    try {
      const { title, description, completed, priority, dueDate } = req.body;

      // Validate title
      if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'title is required and must be a non-empty string'
        });
      }

      // Validate completed if provided
      if (completed !== undefined && typeof completed !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'completed must be a boolean value'
        });
      }

      // Validate priority
      if (priority !== undefined && priority !== null) {
        if (!['low', 'medium', 'high'].includes(priority)) {
          return res.status(400).json({
            success: false,
            message: "priority must be 'low', 'medium', or 'high'"
          });
        }
      }

      // Validate dueDate
      if (dueDate !== undefined && dueDate !== null && dueDate !== '') {
        const parsedDate = Date.parse(dueDate);
        if (isNaN(parsedDate)) {
          return res.status(400).json({
            success: false,
            message: 'dueDate must be a valid date string'
          });
        }
      }

      const finalDueDate = (dueDate !== undefined && dueDate !== null && dueDate !== '') 
        ? new Date(dueDate).toISOString() 
        : null;

      const newTask = TaskModel.create(title, description, priority, finalDueDate, completed);
      return res.status(201).json({
        success: true,
        data: newTask
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Server Error creating task'
      });
    }
  }

  // PUT /api/tasks/:id
  static updateTask(req, res) {
    try {
      const { title, description, completed, priority, dueDate, createdAt } = req.body;
      const taskId = req.params.id;

      // Find if task exists
      const existingTask = TaskModel.getById(taskId);
      if (!existingTask) {
        return res.status(404).json({
          success: false,
          message: `Task with id ${taskId} not found`
        });
      }

      // Validate title if provided
      if (title !== undefined) {
        if (!title || typeof title !== 'string' || title.trim() === '') {
          return res.status(400).json({
            success: false,
            message: 'title cannot be empty'
          });
        }
      }

      // Validate completed if provided
      if (completed !== undefined && typeof completed !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'completed must be a boolean value'
        });
      }

      // Validate priority
      if (priority !== undefined && priority !== null) {
        if (!['low', 'medium', 'high'].includes(priority)) {
          return res.status(400).json({
            success: false,
            message: "priority must be 'low', 'medium', or 'high'"
          });
        }
      }

      // Validate dueDate
      if (dueDate !== undefined && dueDate !== null && dueDate !== '') {
        const parsedDate = Date.parse(dueDate);
        if (isNaN(parsedDate)) {
          return res.status(400).json({
            success: false,
            message: 'dueDate must be a valid date string'
          });
        }
      }

      // Collect provided update fields
      const updates = {};
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (completed !== undefined) updates.completed = completed;
      if (priority !== undefined) updates.priority = priority;
      if (dueDate !== undefined) {
        updates.dueDate = (dueDate === null || dueDate === '') ? null : new Date(dueDate).toISOString();
      }

      // Pass along the updates. Include the attempted 'createdAt' from req.body 
      // so the model can explicitly filter/ignore it, demonstrating protection.
      const updatedTask = TaskModel.update(taskId, { ...updates, createdAt });
      return res.status(200).json({
        success: true,
        data: updatedTask
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Server Error updating task'
      });
    }
  }

  // DELETE /api/tasks/:id
  static deleteTask(req, res) {
    try {
      const taskId = req.params.id;
      const isDeleted = TaskModel.delete(taskId);

      if (!isDeleted) {
        return res.status(404).json({
          success: false,
          message: `Task with id ${taskId} not found`
        });
      }

      return res.status(200).json({
        success: true,
        message: `Task with id ${taskId} has been deleted`
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Server Error deleting task'
      });
    }
  }
}

module.exports = TaskController;
