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
  assignStaff,
  removeStaff,
} from './agencies.controller';

const router = Router();

// Create agency (admin only)
router.post(
  '/',
  authenticate,
  authorize([UserRole.ADMIN]),
  create
);

// Get all agencies (admin and agency staff)
router.get(
  '/',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.AGENCY_ADMIN, UserRole.AGENCY_STAFF]),
  findAll
);

// Get agency by ID (admin and agency staff)
router.get(
  '/:id',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.AGENCY_ADMIN, UserRole.AGENCY_STAFF]),
  findOne
);

// Update agency (admin only)
router.put(
  '/:id',
  authenticate,
  authorize([UserRole.ADMIN]),
  update
);

// Delete agency (admin only)
router.delete(
  '/:id',
  authenticate,
  authorize([UserRole.ADMIN]),
  remove
);

// Assign staff to agency (admin only)
router.post(
  '/:id/staff/:staffId',
  authenticate,
  authorize([UserRole.ADMIN]),
  assignStaff
);

// Remove staff from agency (admin only)
router.delete(
  '/:id/staff/:staffId',
  authenticate,
  authorize([UserRole.ADMIN]),
  removeStaff
);

export default router; 