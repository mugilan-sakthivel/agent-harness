export const LANGGRAPH_API_URL =
  process.env.NEXT_PUBLIC_LANGGRAPH_API_URL ?? "http://localhost:2024";

export const ASSISTANT_ID =
  process.env.NEXT_PUBLIC_ASSISTANT_ID ?? "harness";

// deepagents state shape we read on the client
export type Todo = {
  content: string;
  status: "pending" | "in_progress" | "completed";
};

export type HarnessState = {
  messages: unknown[];
  todos?: Todo[];
};

// HITL interrupt payload shape (from HumanInTheLoopMiddleware)
export type ActionRequest = {
  name: string;
  args: Record<string, unknown>;
  description?: string;
};

export type ReviewConfig = {
  action_name: string;
  allowed_decisions: ("approve" | "edit" | "reject" | "respond")[];
};

export type HarnessInterrupt = {
  action_requests: ActionRequest[];
  review_configs: ReviewConfig[];
};

export type Decision =
  | { type: "approve" }
  | { type: "reject" }
  | { type: "edit"; args: Record<string, unknown> }
  | { type: "respond"; message: string };
