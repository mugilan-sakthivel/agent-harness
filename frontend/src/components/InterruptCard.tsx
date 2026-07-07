import { useState } from "react";
import { AlertTriangle, Check, X } from "lucide-react";
import { ActionRequest, Decision, HarnessInterrupt, ReviewConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

/**
 * Renders a single HITL interrupt as ONE card. If the interrupt batches
 * multiple action_requests, each gets its own row and a decision; the user
 * answers them and submits once. Single source of truth: the parent only ever
 * passes the live `interrupt`, and hides this card the instant `onResume` is
 * called (optimistic), so it can never render twice.
 */
export function InterruptCard({
  interrupt,
  onResume,
  disabled,
}: {
  interrupt: HarnessInterrupt;
  onResume: (decisions: Decision[]) => void;
  disabled?: boolean;
}) {
  const requests = interrupt.action_requests ?? [];
  const configs = interrupt.review_configs ?? [];

  const [decisions, setDecisions] = useState<(Decision | null)[]>(
    () => requests.map(() => null)
  );

  const configFor = (name: string): ReviewConfig | undefined =>
    configs.find((c) => c.action_name === name);

  const set = (i: number, d: Decision) =>
    setDecisions((prev) => prev.map((p, idx) => (idx === i ? d : p)));

  const allAnswered = decisions.every((d) => d !== null);

  return (
    <div className="rounded-[var(--radius)] border border-warning/40 bg-warning/5 p-4">
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle className="size-4 text-warning" />
        <h3 className="text-sm font-semibold text-foreground">
          Approval required
        </h3>
      </div>

      <div className="space-y-3">
        {requests.map((req: ActionRequest, i) => {
          const cfg = configFor(req.name);
          const allowed = cfg?.allowed_decisions ?? ["approve", "reject"];
          const chosen = decisions[i];
          return (
            <div
              key={i}
              className="rounded-lg border border-border bg-surface-2 p-3"
            >
              <div className="mb-2">
                <span className="font-mono text-xs text-accent">{req.name}</span>
                <pre className="mt-1 overflow-x-auto rounded bg-background p-2 text-xs text-muted">
                  {JSON.stringify(req.args, null, 2)}
                </pre>
              </div>
              <div className="flex flex-wrap gap-2">
                {allowed.includes("approve") && (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => set(i, { type: "approve" })}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition",
                      chosen?.type === "approve"
                        ? "bg-accent-strong text-background"
                        : "border border-border text-foreground hover:bg-surface"
                    )}
                  >
                    <Check className="size-3" /> Approve
                  </button>
                )}
                {allowed.includes("reject") && (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => set(i, { type: "reject" })}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition",
                      chosen?.type === "reject"
                        ? "bg-danger text-background"
                        : "border border-border text-foreground hover:bg-surface"
                    )}
                  >
                    <X className="size-3" /> Reject
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        disabled={disabled || !allAnswered}
        onClick={() => onResume(decisions.filter(Boolean) as Decision[])}
        className="mt-4 w-full rounded-md bg-accent-strong px-3 py-2 text-sm font-semibold text-background transition disabled:cursor-not-allowed disabled:opacity-40"
      >
        Submit decision{requests.length > 1 ? "s" : ""}
      </button>
    </div>
  );
}
