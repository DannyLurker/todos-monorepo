import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { prisma } from '@repo/database';
import type { Role } from '@repo/database/client';

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
} as const;

@Injectable()
export class UsersService {
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll(role?: Role) {
    const users = await prisma.user.findMany({
      where: role ? { role } : undefined,
      select: publicUserSelect,
      orderBy: { name: 'asc' },
    });

    return {
      message: 'Users retrieved successfully',
      users,
    };
  }

  async findWorkers() {
    return this.findAll('PROGRAMMER');
  }

  async findOne(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });

    return {
      message: 'User retrieved successfully',
      user,
    };
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: string) {
    const user = await prisma.user.delete({
      where: { id },
      select: publicUserSelect,
    });

    return {
      message: 'User deleted successfully',
      user,
    };
  }
}
