import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/auth.middleware';
import { UserRole } from '@prisma/client';
import {
  create,
  findAll,
  findOne,
  update,
  remove,
} from './categories.controller';

const router = Router();

// Create category (admin only)
router.post(
  '/',
  authenticate,
  authorize([UserRole.ADMIN]),
  create
);

// Get all categories (admin, agency admin, and agency staff)
router.get(
  '/',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.AGENCY_ADMIN, UserRole.AGENCY_STAFF]),
  findAll
);

// Get category by ID (admin, agency admin, and agency staff)
router.get(
  '/:id',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.AGENCY_ADMIN, UserRole.AGENCY_STAFF]),
  findOne
);

// Update category (admin only)
router.put(
  '/:id',
  authenticate,
  authorize([UserRole.ADMIN]),
  update
);

// Delete category (admin only)
router.delete(
  '/:id',
  authenticate,
  authorize([UserRole.ADMIN]),
  remove
);

export default router; 