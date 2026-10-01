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

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(todoCreateSchema))
  create(@Body() createTodoDto: CreateTodoDto) {
    return this.todosService.create(createTodoDto, prisma);
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

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(todoUpdateSchema))
  update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto) {
    return this.todosService.update(id, updateTodoDto, prisma);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.todosService.remove(id, prisma);
  }
}
