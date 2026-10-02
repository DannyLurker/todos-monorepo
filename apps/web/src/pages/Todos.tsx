import { useEffect, useRef, useState } from "react";
import type { TodoStatus } from "@repo/database/client";
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from "@/components/kibo-ui/kanban";
import { useDebounce } from "@/hooks/useDebouncer";
import { Button } from "@/components/ui/button";
import CreateTodoDialog from "@/features/todos/CreateTodoDialog";
import { authClient } from "@repo/auth/client";

export type DetailTodo = {
  id: string;
  title: string;
  todoId: string;
};

export type TodoWithDetailTodo = {
  id: string;
  title: string;
  point: number;
  status: TodoStatus;
  comment: string | null;
  assignedWorker: string;
  createdAt: Date;
  updatedAt: Date;
  detailTodos: DetailTodo[];
};

export type KanbanTodo = TodoWithDetailTodo & {
  name: string;
  column: string;
};

type Role = "PROJECT_MANAGER" | "PROGRAMMER";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
});

const columns = [
  { id: "PUBLISH", name: "Publish", color: "#6B7280" },
  { id: "PREVIEW", name: "Preview", color: "#F59E0B" },
  { id: "DONE", name: "Done", color: "#10B981" },
];

function canMove(from: string, to: string, role?: string): boolean {
  if (from === to) return true;
  if (from === "DONE") return false;
  if (role === "PROGRAMMER") {
    return from === "PUBLISH" && to === "PREVIEW";
  }
  if (role === "PROJECT_MANAGER") {
    // Managers approve (PREVIEW -> DONE) or request changes (PREVIEW -> PUBLISH).
    // They never move PUBLISH -> PREVIEW and never skip review.
    if (from === "PREVIEW" && (to === "DONE" || to === "PUBLISH")) return true;
    return false;
  }
  return false;
}

function moveDeniedMessage(from: string, to: string, role?: string): string {
  if (role === "PROGRAMMER") {
    return `Programmers can only move PUBLISH → PREVIEW (tried ${from} → ${to}).`;
  }
  if (role === "PROJECT_MANAGER") {
    if (from === "PUBLISH" && to === "PREVIEW") {
      return "Project managers cannot move PUBLISH → PREVIEW. Programmers submit work for review.";
    }
    return `Project managers can only move PREVIEW → DONE or PREVIEW → PUBLISH (tried ${from} → ${to}).`;
  }
  return `Move ${from} → ${to} is not allowed for your role.`;
}

const Todos = () => {
  const { data: session } = authClient.useSession();
  const role = (session?.user as { role?: Role } | undefined)?.role;
  const isManager = role === "PROJECT_MANAGER";

  const [todos, setTodos] = useState<KanbanTodo[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [savingCommentId, setSavingCommentId] = useState<string | null>(null);
  // Use a ref to always compare against the latest state inside the debounced closure
  const todosRef = useRef<KanbanTodo[]>([]);
  todosRef.current = todos;

  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:3000/todos", {
        credentials: "include",
      });
      if (response.status === 401) {
        setSaveError("Session expired. Please login again.");
        return;
      }
      const data = await response.json();
      const rawTodos: TodoWithDetailTodo[] = data.todos || [];

      const formattedTodos: KanbanTodo[] = rawTodos.map((todo) => ({
        ...todo,
        name: todo.title,
        column: todo.status,
      }));

      setTodos(formattedTodos);
      setCommentDrafts((prev) => {
        const next = { ...prev };
        for (const t of rawTodos) {
          if (!(t.id in next)) next[t.id] = t.comment ?? "";
        }
        return next;
      });
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const persistTodo = async (
    todoId: string,
    payload: { status?: string; comment?: string | null },
  ) => {
    const response = await fetch(`http://localhost:3000/todos/${todoId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      const message =
        (body as { message?: string })?.message ??
        `Failed to save changes (${response.status})`;
      throw new Error(Array.isArray(message) ? message.join(", ") : message);
    }
  };

  // 1. Debounced function that handles sending PATCH requests to NestJS
  const debouncedSaveStatus = useDebounce(
    async (todoId: string, newStatus: string, comment?: string) => {
      try {
        setSaveError(null);
        await persistTodo(todoId, {
          status: newStatus,
          ...(comment !== undefined && { comment }),
        });
        fetchData();
      } catch (error) {
        console.error("Failed to persist status change:", error);
        setSaveError(
          error instanceof Error
            ? error.message
            : "Failed to save status change. List has been refreshed.",
        );
        // Revert UI to database state if request fails
        fetchData();
      }
    },
    500, // Wait 500ms after dragging stops before sending request
  );

  // 2. Immediate local state handler passed to Kibo UI
  const handleDataChange = (newTodos: KanbanTodo[]) => {
    // Detect which item changed its column/status
    const movedTodo = newTodos.find((newTodo) => {
      const originalTodo = todosRef.current.find((t) => t.id === newTodo.id);
      return originalTodo && originalTodo.column !== newTodo.column;
    });

    if (!movedTodo) {
      setTodos(newTodos);
      return;
    }

    const originalTodo = todosRef.current.find((t) => t.id === movedTodo.id);
    const from = originalTodo?.column ?? "";
    const to = movedTodo.column;

    if (!canMove(from, to, role)) {
      setSaveError(moveDeniedMessage(from, to, role));
      // Revert UI to database state
      fetchData();
      return;
    }

    // Immediate UI update for smooth dragging
    setTodos(newTodos);

    // When a manager sends PREVIEW back to PUBLISH, require a review note
    // so the programmer knows what to fix.
    if (isManager && from === "PREVIEW" && to === "PUBLISH") {
      const note = window.prompt(
        "Request changes: add a note for the programmer (saved to comment field).",
        originalTodo?.comment ?? "",
      );
      if (note === null) {
        fetchData();
        return;
      }
      setCommentDrafts((prev) => ({ ...prev, [movedTodo.id]: note }));
      debouncedSaveStatus(movedTodo.id, movedTodo.column, note);
      return;
    }

    // Queue debounced API call if a card moved across columns
    debouncedSaveStatus(movedTodo.id, movedTodo.column);
  };

  const handleSaveComment = async (todoId: string) => {
    const comment = commentDrafts[todoId] ?? "";
    setSavingCommentId(todoId);
    setSaveError(null);
    try {
      await persistTodo(todoId, { comment });
      fetchData();
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Failed to save comment.",
      );
    } finally {
      setSavingCommentId(null);
    }
  };

  return (
    <div className="py-4">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Todos</h1>
          <p className="text-xs text-muted-foreground">
            {role === "PROGRAMMER" &&
              "Programmers: drag PUBLISH → PREVIEW to submit work for review."}
            {role === "PROJECT_MANAGER" &&
              "Managers: drag PREVIEW → DONE to approve, or PREVIEW → PUBLISH with a note to request changes."}
            {!role && "Drag cards between columns to update their status."}
          </p>
        </div>
        {isManager ? (
          <Button onClick={() => setIsCreateOpen(true)}>+ New Todo</Button>
        ) : (
          <p className="text-xs text-muted-foreground">
            Only project managers can create todos.
          </p>
        )}
      </div>

      {saveError && (
        <div className="mb-3 rounded-md border border-destructive/20 bg-destructive/15 p-3 text-sm text-destructive">
          {saveError}
        </div>
      )}

      <KanbanProvider
        columns={columns}
        data={todos}
        onDataChange={handleDataChange}
      >
        {(column) => (
          <KanbanBoard id={column.id} key={column.id}>
            <KanbanHeader>
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: column.color }}
                />
                <span>{column.name}</span>
              </div>
            </KanbanHeader>

            <KanbanCards id={column.id}>
              {(todo: KanbanTodo) => (
                <KanbanCard
                  column={column.id}
                  id={todo.id}
                  key={todo.id}
                  name={todo.name}
                >
                  {/* Header: Title and Points */}
                  <div className="flex items-start justify-between gap-2">
                    <p className="m-0 flex-1 font-medium text-sm">
                      {todo.title}
                    </p>
                    {todo.point !== undefined && (
                      <span className="rounded bg-secondary px-2 py-0.5 text-xs font-semibold">
                        {todo.point} pts
                      </span>
                    )}
                  </div>

                  {/* Review note / comment */}
                  {(todo.comment || isManager) && (
                    <div className="mt-3 flex flex-col gap-1 border-t pt-2">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Review note
                      </p>
                      {todo.comment && (
                        <p className="m-0 text-xs text-foreground">
                          {todo.comment}
                        </p>
                      )}
                      <div className="flex gap-1">
                        <input
                          value={commentDrafts[todo.id] ?? ""}
                          onChange={(e) =>
                            setCommentDrafts((prev) => ({
                              ...prev,
                              [todo.id]: e.target.value,
                            }))
                          }
                          placeholder="Add a note for changes..."
                          className="h-7 min-w-0 flex-1 border border-input bg-transparent px-2 text-xs outline-none"
                        />
                        <button
                          type="button"
                          disabled={savingCommentId === todo.id}
                          onClick={() => handleSaveComment(todo.id)}
                          className="h-7 shrink-0 border border-input px-2 text-xs hover:bg-muted disabled:opacity-50"
                        >
                          {savingCommentId === todo.id ? "..." : "Save"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Render Sub-tasks / Detail Todos */}
                  {todo.detailTodos && todo.detailTodos.length > 0 && (
                    <div className="mt-3 flex flex-col gap-1 border-t pt-2">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Sub-tasks ({todo.detailTodos.length})
                      </p>
                      <ul className="m-0 pl-4 text-xs space-y-0.5 list-disc text-muted-foreground">
                        {todo.detailTodos.map((detail) => (
                          <li key={detail.id}>{detail.title}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Date Footer */}
                  {todo.createdAt && (
                    <p className="mt-2 text-muted-foreground text-[11px]">
                      Created: {dateFormatter.format(new Date(todo.createdAt))}
                    </p>
                  )}
                </KanbanCard>
              )}
            </KanbanCards>
          </KanbanBoard>
        )}
      </KanbanProvider>

      {isManager && (
        <CreateTodoDialog
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreated={fetchData}
        />
      )}
    </div>
  );
};

export default Todos;
