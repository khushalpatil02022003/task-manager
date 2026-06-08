const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/taskController');

// Map endpoints to controller actions
router.route('/')
  .get(TaskController.getAllTasks)
  .post(TaskController.createTask);

router.route('/:id')
  .get(TaskController.getTaskById)
  .put(TaskController.updateTask)
  .delete(TaskController.deleteTask);

module.exports = router;
