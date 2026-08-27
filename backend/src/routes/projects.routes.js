const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/projects.controller');

const router = express.Router();
router.use(requireAuth);

router.get('/', ctrl.listProjects);
router.post('/', ctrl.createProject);
router.get('/:id', ctrl.getProject);
router.patch('/:id', ctrl.updateProject);
router.delete('/:id', ctrl.deleteProject);

module.exports = router;
