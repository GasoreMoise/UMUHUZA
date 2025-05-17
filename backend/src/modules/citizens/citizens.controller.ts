import { Request, Response } from 'express';
import { CitizensService } from './citizens.service';
import { CreateCitizenDto } from './dto/create-citizen.dto';
import { UpdateCitizenDto } from './dto/update-citizen.dto';
import { UserRole } from '@prisma/client';

const citizensService = new CitizensService();

/**
 * @swagger
 * /api/citizens:
 *   post:
 *     summary: Register a new citizen
 *     tags: [Citizens]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCitizenDto'
 *     responses:
 *       201:
 *         description: Citizen registered successfully
 *       400:
 *         description: Invalid input or email already registered
 */
export const register = async (req: Request, res: Response) => {
  try {
    const createCitizenDto: CreateCitizenDto = req.body;
    const citizen = await citizensService.create(createCitizenDto);
    return res.status(201).json(citizen);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/citizens:
 *   get:
 *     summary: Get all citizens (admin only)
 *     tags: [Citizens]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for name or email
 *     responses:
 *       200:
 *         description: List of citizens with pagination
 *       401:
 *         description: Unauthorized
 */
export const findAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const citizens = await citizensService.findAll(page, limit, search);
    return res.json(citizens);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/citizens/{id}:
 *   get:
 *     summary: Get citizen by ID
 *     tags: [Citizens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Citizen details
 *       404:
 *         description: Citizen not found
 */
export const findOne = async (req: Request, res: Response) => {
  try {
    const citizen = await citizensService.findOne(req.params.id);
    return res.json(citizen);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/citizens/{id}:
 *   put:
 *     summary: Update citizen profile
 *     tags: [Citizens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCitizenDto'
 *     responses:
 *       200:
 *         description: Citizen updated successfully
 *       404:
 *         description: Citizen not found
 */
export const update = async (req: Request, res: Response) => {
  try {
    const updateCitizenDto: UpdateCitizenDto = req.body;
    const citizen = await citizensService.update(req.params.id, updateCitizenDto);
    return res.json(citizen);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/citizens/{id}:
 *   delete:
 *     summary: Deactivate citizen account
 *     tags: [Citizens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Citizen account deactivated successfully
 *       404:
 *         description: Citizen not found
 */
export const remove = async (req: Request, res: Response) => {
  try {
    const result = await citizensService.remove(req.params.id);
    return res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/citizens/profile:
 *   get:
 *     summary: Get authenticated citizen's profile
 *     tags: [Citizens]
 *     responses:
 *       200:
 *         description: Citizen profile retrieved successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Citizen not found
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const citizen = await citizensService.findOne(req.user.userId.toString());
    return res.json(citizen);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/citizens/admin:
 *   post:
 *     summary: Register a new admin user
 *     tags: [Citizens]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCitizenDto'
 *     responses:
 *       201:
 *         description: Admin user registered successfully
 *       400:
 *         description: Invalid input or email already registered
 */
export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const createCitizenDto: CreateCitizenDto = req.body;
    const admin = await citizensService.create(createCitizenDto, UserRole.ADMIN);
    return res.status(201).json(admin);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 