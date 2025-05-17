import { Request, Response } from 'express';
import { AgenciesService } from './agencies.service';
import { CreateAgencyDto } from './dto/create-agency.dto';
import { UpdateAgencyDto } from './dto/update-agency.dto';

const agenciesService = new AgenciesService();

/**
 * @swagger
 * /api/agencies:
 *   post:
 *     summary: Create a new agency
 *     tags: [Agencies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAgencyDto'
 *     responses:
 *       201:
 *         description: Agency created successfully
 *       400:
 *         description: Invalid input or agency name already exists
 */
export const create = async (req: Request, res: Response) => {
  try {
    const createAgencyDto: CreateAgencyDto = req.body;
    const agency = await agenciesService.create(createAgencyDto);
    return res.status(201).json(agency);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/agencies:
 *   get:
 *     summary: Get all agencies
 *     tags: [Agencies]
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
 *         description: Search term for name or description
 *     responses:
 *       200:
 *         description: List of agencies with pagination
 */
export const findAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const agencies = await agenciesService.findAll(page, limit, search);
    return res.json(agencies);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/agencies/{id}:
 *   get:
 *     summary: Get agency by ID
 *     tags: [Agencies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agency details
 *       404:
 *         description: Agency not found
 */
export const findOne = async (req: Request, res: Response) => {
  try {
    const agency = await agenciesService.findOne(req.params.id);
    return res.json(agency);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/agencies/{id}:
 *   put:
 *     summary: Update agency
 *     tags: [Agencies]
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
 *             $ref: '#/components/schemas/UpdateAgencyDto'
 *     responses:
 *       200:
 *         description: Agency updated successfully
 *       404:
 *         description: Agency not found
 */
export const update = async (req: Request, res: Response) => {
  try {
    const updateAgencyDto: UpdateAgencyDto = req.body;
    const agency = await agenciesService.update(req.params.id, updateAgencyDto);
    return res.json(agency);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/agencies/{id}:
 *   delete:
 *     summary: Delete agency
 *     tags: [Agencies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agency deleted successfully
 *       404:
 *         description: Agency not found
 */
export const remove = async (req: Request, res: Response) => {
  try {
    const result = await agenciesService.remove(req.params.id);
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
 * /api/agencies/{id}/staff/{staffId}:
 *   post:
 *     summary: Assign staff member to agency
 *     tags: [Agencies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Staff member assigned successfully
 *       404:
 *         description: Agency or staff member not found
 */
export const assignStaff = async (req: Request, res: Response) => {
  try {
    const { id: agencyId, staffId } = req.params;
    const staff = await agenciesService.assignStaff(agencyId, staffId);
    return res.json(staff);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/agencies/{id}/staff/{staffId}:
 *   delete:
 *     summary: Remove staff member from agency
 *     tags: [Agencies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Staff member removed successfully
 *       404:
 *         description: Agency or staff member not found
 */
export const removeStaff = async (req: Request, res: Response) => {
  try {
    const { id: agencyId, staffId } = req.params;
    const staff = await agenciesService.removeStaff(agencyId, staffId);
    return res.json(staff);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 