import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/signup', AuthController.signUp);
router.post('/signin', AuthController.signIn);

// Protected routes
router.get('/profile', authenticateToken, AuthController.getProfile);
router.patch('/profile', authenticateToken, AuthController.updateProfile);

export default router;
