"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useStream } from "@langchain/langgraph-sdk/react";
import { Client } from "@langchain/langgraph-sdk";
import { Send, Square, RotateCcw } from "lucide-react";
import {
  ASSISTANT_ID,
  Decision,
  HarnessInterrupt,
  LANGGRAPH_API_URL,
  Todo,
} from "@/lib/config";
import { TodoPanel } from "./TodoPanel";
import { InterruptCard } from "./InterruptCard";
import { cn } from "@/lib/utils";

function setThreadIdInUrl(threadId: string) {
  const url = new URL(window.location.href);
  url.searchParams.set("threadId", threadId);
  window.history.replaceState({}, "", url.toString());
}

type Msg = { id?: string; type?: string; content?: unknown; tool_calls?: unknown[] };

function textOf(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content))
    return content
      .map((p) => (typeof p === "string" ? p : (p as { text?: string })?.text ?? ""))
      .join("");
  return "";
}

export function Harness() {
  // Start undefined so SSR and the first client render agree (no hydration
  // mismatch); read the URL after mount to restore an existing thread.
  const [threadId, setThreadId] = useState<string | undefined>(undefined);
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("threadId");
    if (id) setThreadId(id);
  }, []);
  const [input, setInput] = useState("");
  // Bug #1 guard: remember which interrupt ids we've already acted on so a
  // stale interrupt can never render a second time.
  const resolvedInterrupts = useRef<Set<string>>(new Set());
  const [, force] = useState(0);
  const client = useMemo(() => new Client({ apiUrl: LANGGRAPH_API_URL }), []);

  const thread = useStream<{ messages: Msg[]; todos?: Todo[] }>({
    apiUrl: LANGGRAPH_API_URL,
    assistantId: ASSISTANT_ID,
    threadId,
    onThreadId: (id) => {
      setThreadId(id);
      setThreadIdInUrl(id);
    },
    reconnectOnMount: true, // Bug #3: resume an in-flight stream after refresh
    fetchStateHistory: true, // Bug #3: rehydrate todos + interrupt after refresh
  });

  const messages = (thread.messages ?? []) as Msg[];
  const todos = (thread.values?.todos ?? []) as Todo[];

  // Bug #1: single source of truth for the interrupt. Hide it while a resume is
  // in flight and once it's been acted on.
  const rawInterrupt = thread.interrupt as
    | { id?: string; value?: HarnessInterrupt }
    | undefined;
  const interruptId = rawInterrupt?.id ?? "current";
  const showInterrupt =
    !!rawInterrupt?.value &&
    !thread.isLoading &&
    !resolvedInterrupts.current.has(interruptId);

  const send = async () => {
    const text = input.trim();
    if (!text || thread.isLoading) return;
    setInput("");
    // Bug #2: reset todos at the start of every new turn so the previous
    // query's plan never leaks into the next one. The graph input schema
    // ignores extra keys, so we clear the thread state explicitly first.
    if (threadId) {
      try {
        await client.threads.updateState(threadId, { values: { todos: [] } });
      } catch {
        // non-fatal: a fresh agent turn will rewrite todos anyway
      }
    }
    thread.submit({ messages: [{ type: "human", content: text }] });
  };

  const resume = (decisions: Decision[]) => {
    resolvedInterrupts.current.add(interruptId); // optimistic hide
    force((n) => n + 1);
    thread.submit(undefined, { command: { resume: { decisions } } });
  };

  const newThread = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("threadId");
    window.location.href = url.toString();
  };

  const visibleMessages = useMemo(
    () => messages.filter((m) => m.type === "human" || m.type === "ai"),
    [messages]
  );

  // Sub-agent activity derived from messages: each `task` tool call is a
  // sub-agent run; it's "done" once a matching tool result comes back.
  const subagentRuns = useMemo(() => {
    const calls: { id: string; label: string }[] = [];
    const returned = new Set<string>();
    for (const m of messages) {
      for (const tc of (m.tool_calls ?? []) as { id?: string; name?: string; args?: Record<string, unknown> }[]) {
        if (tc.name === "task" && tc.id) {
          calls.push({
            id: tc.id,
            label:
              (tc.args?.subagent_type as string) ??
              (tc.args?.description as string) ??
              "sub-agent",
          });
        }
      }
      if (m.type === "tool") {
        const id = (m as { tool_call_id?: string }).tool_call_id;
        if (id) returned.add(id);
      }
    }
    return calls.map((c) => ({ ...c, done: returned.has(c.id) }));
  }, [messages]);

  return (
    <div className="mx-auto grid h-screen max-w-6xl grid-cols-1 gap-4 p-4 md:grid-cols-[1fr_320px]">
      {/* Conversation */}
      <div className="flex min-h-0 flex-col rounded-[var(--radius)] border border-border bg-surface">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h1 className="text-sm font-semibold">Reliable Agent Harness</h1>
            <p className="text-xs text-muted">
              {threadId ? `thread ${threadId.slice(0, 8)}…` : "new thread"}
            </p>
          </div>
          <button
            onClick={newThread}
            className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted hover:text-foreground"
          >
            <RotateCcw className="size-3" /> New
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {visibleMessages.length === 0 && (
            <p className="text-sm text-muted">
              Try: “Please send an email to bob.” (triggers a plan + approval) or
              “Research deep agents.”
            </p>
          )}
          {visibleMessages.map((m, i) => {
            const text = textOf(m.content);
            const isHuman = m.type === "human";
            const toolCalls = (m.tool_calls ?? []) as { name?: string }[];
            return (
              <div
                key={m.id ?? i}
                className={cn("flex", isHuman ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                    isHuman
                      ? "bg-accent-strong text-background"
                      : "bg-surface-2 text-foreground"
                  )}
                >
                  {text && <p className="whitespace-pre-wrap">{text}</p>}
                  {toolCalls.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {toolCalls.map((tc, j) => (
                        <span
                          key={j}
                          className="rounded bg-background px-2 py-0.5 font-mono text-[11px] text-accent"
                        >
                          ⚙ {tc.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {showInterrupt && rawInterrupt?.value && (
            <InterruptCard
              interrupt={rawInterrupt.value}
              onResume={resume}
              disabled={thread.isLoading}
            />
          )}

          {thread.isLoading && (
            <div className="text-xs text-muted">streaming…</div>
          )}
        </div>

        <div className="border-t border-border p-3">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder="Message the agent…"
              className="min-h-[40px] flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
            {thread.isLoading ? (
              <button
                onClick={() => thread.stop()}
                className="inline-flex size-10 items-center justify-center rounded-md border border-border text-danger"
                title="Stop"
              >
                <Square className="size-4" />
              </button>
            ) : (
              <button
                onClick={send}
                className="inline-flex size-10 items-center justify-center rounded-md bg-accent-strong text-background disabled:opacity-40"
                disabled={!input.trim()}
                title="Send"
              >
                <Send className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Side panel */}
      <aside className="min-h-0 space-y-4 overflow-y-auto">
        <TodoPanel todos={todos} />
        <div className="rounded-[var(--radius)] border border-border bg-surface p-4">
          <h2 className="mb-3 text-sm font-semibold">Sub-agents</h2>
          {subagentRuns.length === 0 ? (
            <p className="text-xs text-muted">No sub-agent runs this thread.</p>
          ) : (
            <ul className="space-y-2">
              {subagentRuns.map((s) => (
                <li key={s.id} className="flex items-center gap-2 text-sm">
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      s.done ? "bg-accent-strong" : "animate-pulse bg-warning"
                    )}
                  />
                  <span className="font-mono text-xs">{s.label}</span>
                  <span className="ml-auto text-[11px] text-muted">
                    {s.done ? "done" : "running"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
