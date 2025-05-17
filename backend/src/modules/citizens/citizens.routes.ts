import { Router } from 'express';
import { register, findAll, findOne, update, remove, getProfile, registerAdmin } from './citizens.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/', register);
router.post('/admin', registerAdmin);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, update);

// Admin only routes
router.get('/', authenticate, authorize(['ADMIN']), findAll);
router.get('/:id', authenticate, authorize(['ADMIN']), findOne);
router.put('/:id', authenticate, authorize(['ADMIN']), update);
router.delete('/:id', authenticate, authorize(['ADMIN']), remove);

export default router; 