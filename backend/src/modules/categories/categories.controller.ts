import { Request, Response } from 'express';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

const categoriesService = new CategoriesService();

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoryDto'
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Invalid input or category name already exists
 */
export const create = async (req: Request, res: Response) => {
  try {
    const createCategoryDto: CreateCategoryDto = req.body;
    const category = await categoriesService.create(createCategoryDto);
    return res.status(201).json(category);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
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
 *       - in: query
 *         name: agencyId
 *         schema:
 *           type: string
 *         description: Filter by agency ID
 *     responses:
 *       200:
 *         description: List of categories with pagination
 */
export const findAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const agencyId = req.query.agencyId as string;

    const categories = await categoriesService.findAll(page, limit, search, agencyId);
    return res.json(categories);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category details
 *       404:
 *         description: Category not found
 */
export const findOne = async (req: Request, res: Response) => {
  try {
    const category = await categoriesService.findOne(req.params.id);
    return res.json(category);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update category
 *     tags: [Categories]
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
 *             $ref: '#/components/schemas/UpdateCategoryDto'
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       404:
 *         description: Category not found
 */
export const update = async (req: Request, res: Response) => {
  try {
    const updateCategoryDto: UpdateCategoryDto = req.body;
    const category = await categoriesService.update(req.params.id, updateCategoryDto);
    return res.json(category);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 */
export const remove = async (req: Request, res: Response) => {
  try {
    const result = await categoriesService.remove(req.params.id);
    return res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 