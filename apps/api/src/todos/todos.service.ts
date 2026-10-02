import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TodoUpdateSchema as UpdateTodoDto } from '@repo/schema';
import { type TodoCreateSchema as CreateTodoDto } from '@repo/schema';
import { TodosRepository } from './todos.repository.js';
import { Prisma, PrismaClient, TodoStatus } from '@repo/database/client';

function isStatusTransitionAllowed(
  from: TodoStatus,
  to: TodoStatus,
  role?: string,
): boolean {
  if (from === to) return true;
  // DONE is terminal for everyone
  if (from === 'DONE') return false;
  if (role === 'PROGRAMMER') {
    // Programmers may only submit work for review
    return from === 'PUBLISH' && to === 'PREVIEW';
  }
  if (role === 'PROJECT_MANAGER') {
    // Managers may approve (PREVIEW -> DONE) or request changes (PREVIEW -> PUBLISH).
    // They may NOT move PUBLISH -> PREVIEW and may NOT skip review.
    if (from === 'PREVIEW' && (to === 'DONE' || to === 'PUBLISH')) return true;
    return false;
  }
  return false;
}

@Injectable()
export class TodosService {
  constructor(private readonly todosRepository: TodosRepository) {}

  async create(
    createTodoDto: CreateTodoDto,
    prisma: PrismaClient | Prisma.TransactionClient,
    role?: string,
  ) {
    if (role !== 'PROJECT_MANAGER') {
      throw new ForbiddenException('Only project managers can create todos');
    }

    const transaction = await prisma.$transaction(async (tx) => {
      const todo = await this.todosRepository.create(
        {
          point: createTodoDto.point,
          title: createTodoDto.title,
          status: createTodoDto.status as TodoStatus,
          ...(createTodoDto.comment !== undefined && {
            comment: createTodoDto.comment,
          }),
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
      todos: todos,
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
    role?: string,
  ) {
    if (updateTodoDto.status !== undefined) {
      const current = await this.todosRepository.findOne(id, prisma);
      if (!current) {
        throw new NotFoundException('Todo not found');
      }
      const from = current.status as TodoStatus;
      const to = updateTodoDto.status as TodoStatus;
      if (!isStatusTransitionAllowed(from, to, role)) {
        throw new ForbiddenException(
          `Role ${role ?? 'unknown'} may not move todo from ${from} to ${to}`,
        );
      }
    }

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
          status: updateTodoDto.status as TodoStatus,
        }),
        ...(updateTodoDto.comment !== undefined && {
          comment: updateTodoDto.comment,
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
