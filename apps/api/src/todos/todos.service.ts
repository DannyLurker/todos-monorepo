import { Injectable } from '@nestjs/common';
import { TodoUpdateSchema as UpdateTodoDto } from '@repo/schema';
import { type TodoCreateSchema as CreateTodoDto } from '@repo/schema';
import { TodosRepository } from './todos.repository.js';
import { prisma, Prisma, PrismaClient } from '@repo/database';

@Injectable()
export class TodosService {
  constructor(private readonly todosRepository: TodosRepository) {}

  async create(
    createTodoDto: CreateTodoDto,
    prisma: PrismaClient | Prisma.TransactionClient,
  ) {
    const transaction = await prisma.$transaction(async (tx) => {
      const todo = await this.todosRepository.create(
        {
          point: createTodoDto.point,
          title: createTodoDto.title,
          status: createTodoDto.status,
          user: {
            connect: {
              id: createTodoDto.assignedWorker,
            },
          },
          detailTodos: {
            createMany: {
              data: createTodoDto.detailTodos,
            },
          },
        },
        tx,
      );

      return {
        todo,
      };
    });

    return {
      message: 'Todo created successfully',
      todo: transaction.todo,
    };
  }

  async findAll(prisma: PrismaClient | Prisma.TransactionClient) {
    const todos = await this.todosRepository.findAll(prisma);

    return {
      message: 'Todos retrieved successfully',
      todo: todos,
    };
  }

  async findOne(id: string, prisma: PrismaClient | Prisma.TransactionClient) {
    const todo = await this.todosRepository.findOne(id, prisma);

    return {
      message: 'Todo retrieved successfully',
      todo: todo,
    };
  }

  async update(
    id: string,
    updateTodoDto: UpdateTodoDto,
    prisma: PrismaClient | Prisma.TransactionClient,
  ) {
    const todo = await this.todosRepository.update(
      id,
      {
        ...(updateTodoDto.title !== undefined && {
          title: updateTodoDto.title,
        }),
        ...(updateTodoDto.point !== undefined && {
          point: updateTodoDto.point,
        }),
        ...(updateTodoDto.status !== undefined && {
          status: updateTodoDto.status,
        }),
        ...(updateTodoDto.assignedWorker && {
          user: {
            connect: { id: updateTodoDto.assignedWorker },
          },
        }),
        ...(updateTodoDto.detailTodos && updateTodoDto.detailTodos.length > 0
          ? {
              detailTodos: {
                deleteMany: {},
                create: updateTodoDto.detailTodos,
              },
            }
          : {}),
      },
      prisma,
    );

    return {
      message: 'Todo updated successfully',
      todo: todo,
    };
  }

  async remove(id: string, prisma: PrismaClient | Prisma.TransactionClient) {
    const todo = await this.todosRepository.delete(id, prisma);

    return {
      message: 'Todo deleted successfully',
      todo: todo,
    };
  }
}
