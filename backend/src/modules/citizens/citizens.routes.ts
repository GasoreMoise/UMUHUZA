import { Router } from 'express';
import { register, findAll, findOne, update, remove } from './citizens.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';

const router = Router();

// Public routes
router.post('/', register);

// Protected routes
router.get('/profile', authenticate, findOne);
router.put('/profile', authenticate, update);

// Admin only routes
router.get('/', authenticate, authorize(['ADMIN']), findAll);
router.get('/:id', authenticate, authorize(['ADMIN']), findOne);
router.put('/:id', authenticate, authorize(['ADMIN']), update);
router.delete('/:id', authenticate, authorize(['ADMIN']), remove);

export default router; 