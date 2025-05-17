import { Request, Response } from 'express';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { UserRole } from '@prisma/client';

const complaintsService = new ComplaintsService();

/**
 * @swagger
 * /api/complaints:
 *   post:
 *     summary: Create a new complaint
 *     tags: [Complaints]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateComplaintDto'
 *     responses:
 *       201:
 *         description: Complaint created successfully
 *       400:
 *         description: Invalid input or category not found
 */
export const create = async (req: Request, res: Response) => {
  try {
    const createComplaintDto: CreateComplaintDto = req.body;
    const userId = req.user?.userId;
    const complaint = await complaintsService.create(userId!.toString(), createComplaintDto);
    return res.status(201).json(complaint);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/complaints:
 *   get:
 *     summary: Get all complaints
 *     tags: [Complaints]
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
 *         description: Search term for title or description
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *         description: Filter by priority
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: agencyId
 *         schema:
 *           type: string
 *         description: Filter by agency ID
 *     responses:
 *       200:
 *         description: List of complaints with pagination
 */
export const findAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const priority = req.query.priority as string;
    const categoryId = req.query.categoryId as string;
    const agencyId = req.query.agencyId as string;
    const userId = req.user?.userId;
    const userRole = req.user?.role as UserRole;

    const complaints = await complaintsService.findAll(
      page,
      limit,
      search,
      status as any,
      priority,
      categoryId,
      agencyId,
      userId?.toString(),
      userRole
    );
    return res.json(complaints);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/complaints/{id}:
 *   get:
 *     summary: Get complaint by ID
 *     tags: [Complaints]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Complaint details
 *       404:
 *         description: Complaint not found
 */
export const findOne = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role as UserRole;
    const complaint = await complaintsService.findOne(req.params.id, userId!.toString(), userRole);
    return res.json(complaint);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/complaints/{id}:
 *   put:
 *     summary: Update complaint
 *     tags: [Complaints]
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
 *             $ref: '#/components/schemas/UpdateComplaintDto'
 *     responses:
 *       200:
 *         description: Complaint updated successfully
 *       404:
 *         description: Complaint not found
 */
export const update = async (req: Request, res: Response) => {
  try {
    const updateComplaintDto: UpdateComplaintDto = req.body;
    const userId = req.user?.userId;
    const userRole = req.user?.role as UserRole;
    const complaint = await complaintsService.update(req.params.id, userId!.toString(), userRole, updateComplaintDto);
    return res.json(complaint);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/complaints/{id}/comments:
 *   post:
 *     summary: Add comment to complaint
 *     tags: [Complaints]
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
 *             $ref: '#/components/schemas/AddCommentDto'
 *     responses:
 *       200:
 *         description: Comment added successfully
 *       404:
 *         description: Complaint not found
 */
export const addComment = async (req: Request, res: Response) => {
  try {
    const addCommentDto: AddCommentDto = req.body;
    const userId = req.user?.userId;
    const userRole = req.user?.role as UserRole;
    const comment = await complaintsService.addComment(req.params.id, userId!.toString(), userRole, addCommentDto);
    return res.json(comment);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/complaints/{id}:
 *   delete:
 *     summary: Delete complaint
 *     tags: [Complaints]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Complaint deleted successfully
 *       404:
 *         description: Complaint not found
 */
export const remove = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role as UserRole;
    const result = await complaintsService.remove(req.params.id, userId!.toString(), userRole);
    return res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 