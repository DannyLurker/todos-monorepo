import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from '@repo/auth';
import { TodosModule } from './todos/todos.module.js';

@Module({
  imports: [
    UsersModule,
    AuthModule.forRoot({ auth, disableGlobalAuthGuard: true }),
    TodosModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
