-- DropForeignKey
ALTER TABLE "detailTodo" DROP CONSTRAINT "detailTodo_todoId_fkey";

-- AddForeignKey
ALTER TABLE "detailTodo" ADD CONSTRAINT "detailTodo_todoId_fkey" FOREIGN KEY ("todoId") REFERENCES "todo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
