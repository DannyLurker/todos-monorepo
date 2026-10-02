import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@repo/database/client';

@Injectable()
export class TodosRepository {
  async findAll(tx: Prisma.TransactionClient | PrismaClient) {
    return await tx.todo.findMany({
      include: {
        detailTodos: true,
      },
    });
  }

  async create(
    data: Prisma.TodoCreateInput,
    tx: Prisma.TransactionClient | PrismaClient,
  ) {
    return tx.todo.create({
      data,
    });
  }

  async findOne(id: string, tx: Prisma.TransactionClient | PrismaClient) {
    return await tx.todo.findUnique({
      where: {
        id,
      },
      include: {
        detailTodos: true,
      },
    });
  }

  async update(
    id: string,
    data: Prisma.TodoUpdateInput,
    tx: Prisma.TransactionClient | PrismaClient,
  ) {
    return await tx.todo.update({
      where: {
        id,
      },
      data,
    });
  }
  async delete(id: string, tx: Prisma.TransactionClient | PrismaClient) {
    return await tx.todo.delete({
      where: {
        id,
      },
    });
  }
}
