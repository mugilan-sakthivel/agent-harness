import { Check, Circle, Loader2, ListTodo } from "lucide-react";
import { Todo } from "@/lib/config";
import { cn } from "@/lib/utils";

export function TodoPanel({ todos }: { todos: Todo[] }) {
  const done = todos.filter((t) => t.status === "completed").length;
  const pct = todos.length ? Math.round((done / todos.length) * 100) : 0;

  return (
    <section className="rounded-[var(--radius)] border border-border bg-panel/80 backdrop-blur">
      <header className="flex items-center justify-between px-4 pt-4">
        <div className="flex items-center gap-2">
          <ListTodo className="size-4 text-muted" />
          <h2 className="text-[13px] font-semibold tracking-tight">Plan</h2>
        </div>
        {todos.length > 0 && (
          <span className="text-[11px] tabular-nums text-subtle">
            {done}/{todos.length}
          </span>
        )}
      </header>

      {todos.length > 0 && (
        <div className="mx-4 mt-3 h-1 overflow-hidden rounded-full bg-panel-3">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      <div className="p-4 pt-3">
        {todos.length === 0 ? (
          <p className="text-[13px] leading-relaxed text-subtle">
            No active plan. The agent will lay out its steps here.
          </p>
        ) : (
          <ul className="space-y-1">
            {todos.map((t, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 rounded-lg px-2 py-1.5 text-[13px] transition-colors hover:bg-panel-2"
              >
                <span className="mt-0.5 shrink-0">
                  {t.status === "completed" ? (
                    <span className="flex size-4 items-center justify-center rounded-full bg-accent">
                      <Check className="size-3 text-accent-fg" strokeWidth={3} />
                    </span>
                  ) : t.status === "in_progress" ? (
                    <Loader2 className="size-4 animate-spin text-warning" />
                  ) : (
                    <Circle className="size-4 text-subtle" />
                  )}
                </span>
                <span
                  className={cn(
                    "leading-snug",
                    t.status === "completed" && "text-subtle line-through",
                    t.status === "in_progress" && "text-fg",
                    t.status === "pending" && "text-muted"
                  )}
                >
                  {t.content}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
