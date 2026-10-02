import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TodosService } from './todos.service.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipes.js';
import {
  todoCreateSchema,
  todoUpdateSchema,
  type TodoUpdateSchema as UpdateTodoDto,
  type TodoCreateSchema as CreateTodoDto,
} from '@repo/schema';
import { prisma } from '@repo/database';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

function getRole(session: UserSession): string | undefined {
  const role = (session?.user as { role?: string | string[] } | undefined)
    ?.role;
  return Array.isArray(role) ? role[0] : role;
}

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(todoCreateSchema))
  create(
    @Body() createTodoDto: CreateTodoDto,
    @Session() session: UserSession,
  ) {
    return this.todosService.create(createTodoDto, prisma, getRole(session));
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.todosService.findAll(prisma);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.todosService.findOne(id, prisma);
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(todoUpdateSchema)) updateTodoDto: UpdateTodoDto,
    @Session() session: UserSession,
  ) {
    return this.todosService.update(
      id,
      updateTodoDto,
      prisma,
      getRole(session),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.todosService.remove(id, prisma);
  }
}
