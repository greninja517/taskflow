const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/tasks.controller');

const router = express.Router();
router.use(requireAuth);

router.get('/', ctrl.listTasks);
router.post('/', ctrl.createTask);
router.patch('/:id', ctrl.updateTask);
router.delete('/:id', ctrl.deleteTask);

module.exports = router;
