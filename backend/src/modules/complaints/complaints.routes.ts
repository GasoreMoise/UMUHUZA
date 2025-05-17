import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/auth.middleware';
import { UserRole } from '@prisma/client';
import * as complaintsController from './complaints.controller';

const router = Router();

// Create a new complaint (Citizens only)
router.post(
  '/',
  authenticate,
  authorize([UserRole.CITIZEN]),
  complaintsController.create
);

// Get all complaints (with role-based filtering)
router.get(
  '/',
  authenticate,
  complaintsController.findAll
);

// Get a specific complaint
router.get(
  '/:id',
  authenticate,
  complaintsController.findOne
);

// Update a complaint (Citizens can update their own, Staff can update assigned)
router.put(
  '/:id',
  authenticate,
  complaintsController.update
);

// Add a comment to a complaint
router.post(
  '/:id/comments',
  authenticate,
  complaintsController.addComment
);

// Delete a complaint (Citizens can delete their own pending complaints)
router.delete(
  '/:id',
  authenticate,
  complaintsController.remove
);

export default router; 