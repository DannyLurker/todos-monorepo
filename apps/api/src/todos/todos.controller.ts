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
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipes.js';
import {
  todoCreateSchema,
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
  findAll() {
    return this.todosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.todosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto) {
    return this.todosService.update(+id, updateTodoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.todosService.remove(+id);
  }
}
