import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@repo/database';

@Injectable()
export class TodosRepository {
  async findAll(tx: Prisma.TransactionClient | PrismaClient) {
    return await tx.todo.findMany();
  }

  async create(
    data: Prisma.TodoCreateInput,
    tx: Prisma.TransactionClient | PrismaClient,
  ) {
    return tx.todo.create({
      data,
    });
  }
}
