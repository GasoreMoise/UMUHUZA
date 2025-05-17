import { PrismaClient, Prisma } from '@prisma/client';
import { CreateAgencyDto } from './dto/create-agency.dto';
import { UpdateAgencyDto } from './dto/update-agency.dto';

const prisma = new PrismaClient();

export class AgenciesService {
  async create(createAgencyDto: CreateAgencyDto) {
    // Check if agency name already exists
    const existingAgency = await prisma.agency.findUnique({
      where: { name: createAgencyDto.name },
    });

    if (existingAgency) {
      throw new Error('Agency name already exists');
    }

    // Create agency
    const agency = await prisma.agency.create({
      data: createAgencyDto,
      include: {
        staff: true,
        categories: true,
      },
    });

    return agency;
  }

  async findAll(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where: Prisma.AgencyWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ],
      }),
    };

    const [agencies, total] = await Promise.all([
      prisma.agency.findMany({
        where,
        skip,
        take: limit,
        include: {
          staff: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          categories: true,
        },
      }),
      prisma.agency.count({ where }),
    ]);

    return {
      data: agencies,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const agency = await prisma.agency.findUnique({
      where: { id },
      include: {
        staff: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        categories: true,
      },
    });

    if (!agency) {
      throw new Error('Agency not found');
    }

    return agency;
  }

  async update(id: string, updateAgencyDto: UpdateAgencyDto) {
    const agency = await prisma.agency.findUnique({
      where: { id },
    });

    if (!agency) {
      throw new Error('Agency not found');
    }

    // If name is being updated, check if it's already in use
    if (updateAgencyDto.name && updateAgencyDto.name !== agency.name) {
      const existingAgency = await prisma.agency.findUnique({
        where: { name: updateAgencyDto.name },
      });

      if (existingAgency) {
        throw new Error('Agency name already in use');
      }
    }

    const updatedAgency = await prisma.agency.update({
      where: { id },
      data: updateAgencyDto,
      include: {
        staff: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        categories: true,
      },
    });

    return updatedAgency;
  }

  async remove(id: string) {
    const agency = await prisma.agency.findUnique({
      where: { id },
      include: {
        staff: true,
        categories: true,
      },
    });

    if (!agency) {
      throw new Error('Agency not found');
    }

    // Check if agency has staff or categories
    if (agency.staff.length > 0) {
      throw new Error('Cannot delete agency with assigned staff');
    }

    if (agency.categories.length > 0) {
      throw new Error('Cannot delete agency with assigned categories');
    }

    await prisma.agency.delete({
      where: { id },
    });

    return { message: 'Agency deleted successfully' };
  }

  async assignStaff(agencyId: string, staffId: string) {
    const [agency, staff] = await Promise.all([
      prisma.agency.findUnique({
        where: { id: agencyId },
      }),
      prisma.user.findUnique({
        where: { id: staffId },
      }),
    ]);

    if (!agency) {
      throw new Error('Agency not found');
    }

    if (!staff) {
      throw new Error('Staff member not found');
    }

    if (staff.role !== 'AGENCY_STAFF' && staff.role !== 'AGENCY_ADMIN') {
      throw new Error('User must be an agency staff member');
    }

    const updatedStaff = await prisma.user.update({
      where: { id: staffId },
      data: {
        agencyId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return updatedStaff;
  }

  async removeStaff(agencyId: string, staffId: string) {
    const staff = await prisma.user.findUnique({
      where: { id: staffId },
    });

    if (!staff) {
      throw new Error('Staff member not found');
    }

    if (staff.agencyId !== agencyId) {
      throw new Error('Staff member is not assigned to this agency');
    }

    const updatedStaff = await prisma.user.update({
      where: { id: staffId },
      data: {
        agencyId: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return updatedStaff;
  }
} 