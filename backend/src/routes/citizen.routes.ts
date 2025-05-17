import { Router } from 'express';
import { updateProfile } from '../controllers/citizen.controller';
import { updateProfileValidation } from '../middleware/validators/citizen.validator';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Update profile route
router.put(
  '/profile',
  authenticate,
  updateProfileValidation,
  updateProfile
);

export default router; 