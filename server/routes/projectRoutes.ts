import express from 'express';
import { getProjects, createProject, updateProject, deleteProject } from '../controllers/projectController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticate);

router.get('/', getProjects);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;
