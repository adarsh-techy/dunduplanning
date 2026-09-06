import { Router } from 'express';
import { login, logout, getMe, signup, getSetupStatus, refresh } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/setup-status', getSetupStatus);
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/me', protect, getMe);

export default router;
