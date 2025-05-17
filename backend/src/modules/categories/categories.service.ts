import { PrismaClient, Prisma } from '@prisma/client';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

const prisma = new PrismaClient();

export class CategoriesService {
  async create(createCategoryDto: CreateCategoryDto) {
    // Check if category name already exists for the agency
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: createCategoryDto.name,
        agencyId: createCategoryDto.agencyId,
      },
    });

    if (existingCategory) {
      throw new Error('Category name already exists for this agency');
    }

    // Check if agency exists
    const agency = await prisma.agency.findUnique({
      where: { id: createCategoryDto.agencyId },
    });

    if (!agency) {
      throw new Error('Agency not found');
    }

    // Create category
    const category = await prisma.category.create({
      data: createCategoryDto,
      include: {
        agency: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return category;
  }

  async findAll(page = 1, limit = 10, search?: string, agencyId?: string) {
    const skip = (page - 1) * limit;

    const where: Prisma.CategoryWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ],
      }),
      ...(agencyId && { agencyId }),
    };

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        include: {
          agency: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      }),
      prisma.category.count({ where }),
    ]);

    return {
      data: categories,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        agency: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    // If name is being updated, check if it's already in use for the agency
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingCategory = await prisma.category.findFirst({
        where: {
          name: updateCategoryDto.name,
          agencyId: updateCategoryDto.agencyId || category.agencyId,
          id: { not: id },
        },
      });

      if (existingCategory) {
        throw new Error('Category name already exists for this agency');
      }
    }

    // If agency is being updated, check if it exists
    if (updateCategoryDto.agencyId) {
      const agency = await prisma.agency.findUnique({
        where: { id: updateCategoryDto.agencyId },
      });

      if (!agency) {
        throw new Error('Agency not found');
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updateCategoryDto,
      include: {
        agency: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updatedCategory;
  }

  async remove(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        complaints: true,
      },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    // Check if category has associated complaints
    if (category.complaints.length > 0) {
      throw new Error('Cannot delete category with associated complaints');
    }

    await prisma.category.delete({
      where: { id },
    });

    return { message: 'Category deleted successfully' };
  }
} 