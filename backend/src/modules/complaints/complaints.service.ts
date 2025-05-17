import { PrismaClient, Prisma, Status, UserRole, Priority } from '@prisma/client';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { AddCommentDto } from './dto/add-comment.dto';

const prisma = new PrismaClient();

export class ComplaintsService {
  async create(userId: string, createComplaintDto: CreateComplaintDto) {
    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: createComplaintDto.categoryId },
      include: { agency: true },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    // Create complaint
    const complaint = await prisma.complaint.create({
      data: {
        ...createComplaintDto,
        status: Status.PENDING,
        userId: userId,
        agencyId: category.agencyId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        agency: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return complaint;
  }

  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    status?: Status,
    priority?: string,
    categoryId?: string,
    agencyId?: string,
    userId?: string,
    userRole?: UserRole
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.ComplaintWhereInput = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ],
      }),
      ...(status && { status }),
      ...(priority && { priority: priority as Priority }),
      ...(categoryId && { categoryId }),
      ...(agencyId && { agencyId }),
      // Filter by user role
      ...(userRole === UserRole.CITIZEN && { userId }),
      ...(userRole === UserRole.AGENCY_STAFF && { agencyId }),
      ...(userRole === UserRole.AGENCY_ADMIN && { agencyId }),
    };

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          agency: {
            select: {
              id: true,
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          responses: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
            select: {
              id: true,
              content: true,
              createdAt: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.complaint.count({ where }),
    ]);

    return {
      data: complaints,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string, userRole: UserRole) {
    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        agency: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        responses: {
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            content: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!complaint) {
      throw new Error('Complaint not found');
    }

    // Check if user has access to this complaint
    if (
      userRole === UserRole.CITIZEN && complaint.userId !== userId ||
      (userRole === UserRole.AGENCY_STAFF || userRole === UserRole.AGENCY_ADMIN) && complaint.agencyId !== userId
    ) {
      throw new Error('Not authorized to access this complaint');
    }

    return complaint;
  }

  async update(id: string, userId: string, userRole: UserRole, updateComplaintDto: UpdateComplaintDto) {
    const complaint = await prisma.complaint.findUnique({
      where: { id },
    });

    if (!complaint) {
      throw new Error('Complaint not found');
    }

    // Check if user has permission to update
    if (
      userRole === UserRole.CITIZEN && complaint.userId !== userId ||
      (userRole === UserRole.AGENCY_STAFF || userRole === UserRole.AGENCY_ADMIN) && complaint.agencyId !== userId
    ) {
      throw new Error('Not authorized to update this complaint');
    }

    // If category is being updated, check if it exists and belongs to the same agency
    if (updateComplaintDto.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: updateComplaintDto.categoryId },
      });

      if (!category) {
        throw new Error('Category not found');
      }

      if (category.agencyId !== complaint.agencyId) {
        throw new Error('Category does not belong to the same agency');
      }
    }

    const updatedComplaint = await prisma.complaint.update({
      where: { id },
      data: updateComplaintDto,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        agency: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updatedComplaint;
  }

  async addComment(id: string, userId: string, userRole: UserRole, addCommentDto: AddCommentDto) {
    const complaint = await prisma.complaint.findUnique({
      where: { id },
    });

    if (!complaint) {
      throw new Error('Complaint not found');
    }

    // Check if user has permission to comment
    if (
      userRole === UserRole.CITIZEN && complaint.userId !== userId ||
      (userRole === UserRole.AGENCY_STAFF || userRole === UserRole.AGENCY_ADMIN) && complaint.agencyId !== userId
    ) {
      throw new Error('Not authorized to comment on this complaint');
    }

    const response = await prisma.response.create({
      data: {
        content: addCommentDto.content,
        complaintId: id,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return response;
  }

  async remove(id: string, userId: string, userRole: UserRole) {
    const complaint = await prisma.complaint.findUnique({
      where: { id },
    });

    if (!complaint) {
      throw new Error('Complaint not found');
    }

    // Only citizens can delete their own complaints
    if (userRole !== UserRole.CITIZEN || complaint.userId !== userId) {
      throw new Error('Not authorized to delete this complaint');
    }

    // Only pending complaints can be deleted
    if (complaint.status !== Status.PENDING) {
      throw new Error('Only pending complaints can be deleted');
    }

    await prisma.complaint.delete({
      where: { id },
    });

    return { message: 'Complaint deleted successfully' };
  }
} 