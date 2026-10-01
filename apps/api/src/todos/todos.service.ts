import { Injectable } from '@nestjs/common';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { type TodoCreateSchema as CreateTodoDto } from '@repo/schema';
import { TodosRepository } from './todos.repository.js';
import { Prisma, PrismaClient } from '@repo/database';

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
            create: createTodoDto.detailTodos,
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

  findAll() {
    return `This action returns all todos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} todo`;
  }

  update(id: number, updateTodoDto: UpdateTodoDto) {
    return `This action updates a #${id} todo`;
  }

  remove(id: number) {
    return `This action removes a #${id} todo`;
  }
}
