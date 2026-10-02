import { useEffect, useState } from "react";
import { authClient } from "@repo/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

type Worker = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const STATUSES = ["PUBLISH", "PREVIEW", "DONE"] as const;

async function fetchWorkers(): Promise<Worker[]> {
  const endpoints = [
    "http://localhost:3000/users/workers",
    "http://localhost:3000/users?role=PROGRAMMER",
    "http://localhost:3000/users",
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) continue;
      const body = await res.json();
      const users: Worker[] = body.users ?? body ?? [];
      if (Array.isArray(users) && users.length > 0) return users;
      if (Array.isArray(users)) return users;
    } catch {
      // try next endpoint
    }
  }
  return [];
}

export default function CreateTodoDialog({ open, onClose, onCreated }: Props) {
  const { data: session } = authClient.useSession();
  const [title, setTitle] = useState("");
  const [point, setPoint] = useState(1);
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("PUBLISH");
  const [assignedWorker, setAssignedWorker] = useState("");
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [workersLoading, setWorkersLoading] = useState(false);
  const [workersError, setWorkersError] = useState<string | null>(null);
  const [subTaskInput, setSubTaskInput] = useState("");
  const [subTasks, setSubTasks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const load = async () => {
      setWorkersLoading(true);
      setWorkersError(null);
      const list = await fetchWorkers();
      if (cancelled) return;
      setWorkers(list);
      setWorkersLoading(false);
      if (list.length === 0) {
        setWorkersError("No workers found. Make sure users exist.");
        return;
      }
      // Default to logged-in user if they are in the list, else first worker
      setAssignedWorker((prev) => {
        if (prev && list.some((w) => w.id === prev)) return prev;
        const sessionId = session?.user?.id;
        if (sessionId && list.some((w) => w.id === sessionId)) return sessionId;
        return list[0].id;
      });
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [open, session?.user?.id]);

  if (!open) return null;

  const addSubTask = () => {
    const value = subTaskInput.trim();
    if (value.length < 3) {
      setError("Sub-task title must be at least 3 characters.");
      return;
    }
    setSubTasks((prev) => [...prev, value]);
    setSubTaskInput("");
    setError(null);
  };

  const removeSubTask = (index: number) => {
    setSubTasks((prev) => prev.filter((_, i) => i !== index));
  };

  const reset = () => {
    setTitle("");
    setPoint(1);
    setStatus("PUBLISH");
    setAssignedWorker(workers[0]?.id ?? "");
    setSubTaskInput("");
    setSubTasks([]);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const workerId = assignedWorker.trim();
    if (!title.trim() || title.trim().length < 3) {
      setError("Title must be at least 3 characters.");
      return;
    }
    if (!workerId) {
      setError("Please select an assigned worker.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          point: Number(point),
          status,
          assignedWorker: workerId,
          detailTodos: subTasks.map((t) => ({ title: t })),
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          (body as { message?: string })?.message ||
            `Failed to create todo (${response.status})`,
        );
      }

      reset();
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create todo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <CardTitle>Create new todo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-md border border-destructive/20 bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="todo-title">Title</Label>
              <Input
                id="todo-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Implement login page"
                disabled={loading}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="todo-point">Points</Label>
                <Input
                  id="todo-point"
                  type="number"
                  min={1}
                  value={point}
                  onChange={(e) => setPoint(Number(e.target.value))}
                  disabled={loading}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="todo-status">Status</Label>
                <select
                  id="todo-status"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as (typeof STATUSES)[number])
                  }
                  disabled={loading}
                  className="h-8 w-full border border-input bg-transparent px-2.5 text-xs outline-none"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="todo-worker">Assigned worker</Label>
              <select
                id="todo-worker"
                value={assignedWorker}
                onChange={(e) => setAssignedWorker(e.target.value)}
                disabled={loading || workersLoading || workers.length === 0}
                className="h-8 w-full border border-input bg-transparent px-2.5 text-xs outline-none"
                required
              >
                <option value="" disabled>
                  {workersLoading ? "Loading workers..." : "Select a worker"}
                </option>
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.email})
                  </option>
                ))}
              </select>
              {workersError && (
                <p className="text-xs text-destructive">{workersError}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="todo-subtask">Sub-tasks</Label>
              <div className="flex gap-2">
                <Input
                  id="todo-subtask"
                  value={subTaskInput}
                  onChange={(e) => setSubTaskInput(e.target.value)}
                  placeholder="At least 3 characters"
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSubTask();
                    }
                  }}
                />
                <Button type="button" variant="secondary" onClick={addSubTask} disabled={loading}>
                  Add
                </Button>
              </div>
              {subTasks.length > 0 && (
                <ul className="mt-1 flex flex-col gap-1">
                  {subTasks.map((t, i) => (
                    <li
                      key={`${t}-${i}`}
                      className="flex items-center justify-between rounded border px-2 py-1 text-xs"
                    >
                      <span>{t}</span>
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => removeSubTask(i)}
                        disabled={loading}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  reset();
                  onClose();
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || workersLoading}>
                {loading ? "Creating..." : "Create todo"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
