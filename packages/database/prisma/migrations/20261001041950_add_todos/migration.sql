-- CreateEnum
CREATE TYPE "TodoStatus" AS ENUM ('PUBLISH', 'PREVIEW', 'DONE');

-- CreateTable
CREATE TABLE "todo" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "point" INTEGER NOT NULL,
    "status" "TodoStatus" NOT NULL,
    "assignedWorker" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "todo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetailTodo" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "todoId" TEXT NOT NULL,

    CONSTRAINT "DetailTodo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "todo" ADD CONSTRAINT "todo_assignedWorker_fkey" FOREIGN KEY ("assignedWorker") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailTodo" ADD CONSTRAINT "DetailTodo_todoId_fkey" FOREIGN KEY ("todoId") REFERENCES "todo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
