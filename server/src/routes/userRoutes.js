import { Router } from 'express';
import {
  getUsers,
  getUsersBasic,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { protect, requireSuperAdmin } from '../middleware/auth.js';

const router = Router();

// Any authenticated user can fetch the lightweight id/name list -- used to
// pick "who did this task" on a checklist item. No email/permissions exposed.
router.get('/basic', protect, getUsersBasic);

router.use(protect, requireSuperAdmin);

router.get('/', getUsers);
router.post('/', createUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
