import { PrismaClient } from '@prisma/client';
import { CreateCitizenDto } from './dto/create-citizen.dto';
import { UpdateCitizenDto } from './dto/update-citizen.dto';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

const prisma = new PrismaClient();

export class CitizensService {
  async create(createCitizenDto: CreateCitizenDto) {
    const { password, ...citizenData } = createCitizenDto;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: citizenData.email },
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create citizen
    const citizen = await prisma.user.create({
      data: {
        ...citizenData,
        password: hashedPassword,
        role: UserRole.CITIZEN,
      },
    });

    // Remove password from response
    const { password: _, ...result } = citizen;
    return result;
  }

  async findAll(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where = {
      role: UserRole.CITIZEN,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [citizens, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          profilePicture: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: citizens,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const citizen = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!citizen) {
      throw new Error('Citizen not found');
    }

    return citizen;
  }

  async update(id: string, updateCitizenDto: UpdateCitizenDto) {
    const citizen = await prisma.user.findUnique({
      where: { id },
    });

    if (!citizen) {
      throw new Error('Citizen not found');
    }

    // If email is being updated, check if it's already in use
    if (updateCitizenDto.email && updateCitizenDto.email !== citizen.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: updateCitizenDto.email },
      });

      if (existingUser) {
        throw new Error('Email already in use');
      }
    }

    const updatedCitizen = await prisma.user.update({
      where: { id },
      data: updateCitizenDto,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedCitizen;
  }

  async remove(id: string) {
    const citizen = await prisma.user.findUnique({
      where: { id },
    });

    if (!citizen) {
      throw new Error('Citizen not found');
    }

    // Instead of deleting, we'll deactivate the account
    await prisma.user.update({
      where: { id },
      data: {
        email: `${citizen.email}_deactivated_${Date.now()}`,
        name: `${citizen.name}_deactivated`,
      },
    });

    return { message: 'Citizen account deactivated successfully' };
  }
} 