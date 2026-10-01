/*
  Warnings:

  - You are about to drop the `DetailTodo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DetailTodo" DROP CONSTRAINT "DetailTodo_todoId_fkey";

-- DropTable
DROP TABLE "DetailTodo";

-- CreateTable
CREATE TABLE "detailTodo" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "todoId" TEXT NOT NULL,

    CONSTRAINT "detailTodo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "detailTodo" ADD CONSTRAINT "detailTodo_todoId_fkey" FOREIGN KEY ("todoId") REFERENCES "todo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
