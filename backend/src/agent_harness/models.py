"""Model provider abstraction + a deterministic scripted model for testing.

MODEL_PROVIDER selects the backend:
  - "google"     -> ChatGoogleGenerativeAI (Gemini)
  - "openai"     -> ChatOpenAI
  - "anthropic"  -> ChatAnthropic
  - "openrouter" -> ChatOpenAI pointed at OpenRouter
  - "fake"       -> ScriptedChatModel (no network; deterministic harness tests)

This is the "model provider knob": the harness is identical across providers, so
a credential/model problem can never be a harness problem.
"""

from __future__ import annotations

import os

from langchain_core.language_models.chat_models import BaseChatModel


def get_model() -> BaseChatModel:
    provider = os.environ.get("MODEL_PROVIDER", "google").lower()

    if provider == "fake":
        return ScriptedChatModel()

    if provider == "google":
        from langchain_google_genai import ChatGoogleGenerativeAI

        # gemini-2.5-* defaults to dynamic "thinking", which in long tool-using
        # agent loops can return empty messages (model spends the turn thinking
        # and emits no tool call / text). Disable it by default for reliable
        # tool use; override with GOOGLE_THINKING_BUDGET.
        budget = int(os.environ.get("GOOGLE_THINKING_BUDGET", "0"))
        return ChatGoogleGenerativeAI(
            model=os.environ.get("GOOGLE_MODEL", "gemini-2.5-flash"),
            temperature=0,
            thinking_budget=budget,
        )

    if provider == "openai":
        from langchain_openai import ChatOpenAI

        return ChatOpenAI(model=os.environ.get("OPENAI_MODEL", "gpt-4o-mini"), temperature=0)

    if provider == "anthropic":
        from langchain_anthropic import ChatAnthropic

        return ChatAnthropic(
            model=os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-4-6"), temperature=0
        )

    if provider == "openrouter":
        from langchain_openai import ChatOpenAI

        return ChatOpenAI(
            model=os.environ.get("OPENROUTER_MODEL", "google/gemini-2.0-flash-exp"),
            temperature=0,
            base_url="https://openrouter.ai/api/v1",
            api_key=os.environ.get("OPENROUTER_API_KEY"),
        )

    raise ValueError(f"Unknown MODEL_PROVIDER: {provider!r}")


# ---------------------------------------------------------------------------
# Scripted model: deterministic tool-calling for harness reliability tests.
# ---------------------------------------------------------------------------

from typing import Any, Optional, Sequence  # noqa: E402

from langchain_core.callbacks import CallbackManagerForLLMRun  # noqa: E402
from langchain_core.messages import AIMessage, BaseMessage, ToolMessage  # noqa: E402
from langchain_core.outputs import ChatGeneration, ChatResult  # noqa: E402


def _current_turn(messages: Sequence[BaseMessage]) -> list[BaseMessage]:
    """Messages belonging to the latest user turn (after the last HumanMessage)."""
    last_human = -1
    for i, m in enumerate(messages):
        if m.__class__.__name__ == "HumanMessage":
            last_human = i
    return list(messages[last_human:]) if last_human >= 0 else list(messages)


def _tool_results_present(messages: Sequence[BaseMessage]) -> set[str]:
    """Names of tools that produced a ToolMessage in the CURRENT turn only."""
    names: set[str] = set()
    for m in _current_turn(messages):
        if isinstance(m, ToolMessage):
            name = getattr(m, "name", None)
            if name:
                names.add(name)
    return names


def _first_human_text(messages: Sequence[BaseMessage]) -> str:
    """Text of the LATEST human message (drives the scenario for this turn)."""
    text = ""
    for m in messages:
        if m.__class__.__name__ == "HumanMessage":
            content = m.content
            if isinstance(content, str):
                text = content.lower()
            elif isinstance(content, list):
                text = " ".join(
                    part.get("text", "") for part in content if isinstance(part, dict)
                ).lower()
    return text


class ScriptedChatModel(BaseChatModel):
    """Emits a fixed sequence of tool calls / answers based on thread state.

    Scenarios (chosen by keywords in the first human message):
      - contains "email"    -> write_todos, then send_email (HITL interrupt), then answer
      - contains "research" -> task(research-agent subagent), then answer
      - otherwise           -> write_todos, then a plain answer
    """

    @property
    def _llm_type(self) -> str:
        return "scripted"

    def bind_tools(self, tools, **kwargs):  # tools are ignored; scripted output
        return self

    def _generate(
        self,
        messages: list[BaseMessage],
        stop: Optional[list[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> ChatResult:
        done = _tool_results_present(messages)
        intent = _first_human_text(messages)

        if "research" in intent:
            if "task" not in done:
                msg = AIMessage(
                    content="",
                    tool_calls=[
                        {
                            "name": "task",
                            "args": {
                                "description": "Research the requested topic and summarize key facts.",
                                "subagent_type": "research-agent",
                            },
                            "id": "call_task_1",
                            "type": "tool_call",
                        }
                    ],
                )
            else:
                msg = AIMessage(content="Research complete. Here is a concise summary of the findings.")
            return ChatResult(generations=[ChatGeneration(message=msg)])

        if "email" in intent:
            if "write_todos" not in done:
                msg = AIMessage(
                    content="",
                    tool_calls=[
                        {
                            "name": "write_todos",
                            "args": {
                                "todos": [
                                    {"content": "Draft the email", "status": "pending"},
                                    {"content": "Send the email", "status": "pending"},
                                ]
                            },
                            "id": "call_todos_1",
                            "type": "tool_call",
                        }
                    ],
                )
            elif "send_email" not in done:
                msg = AIMessage(
                    content="",
                    tool_calls=[
                        {
                            "name": "send_email",
                            "args": {
                                "to": "bob@example.com",
                                "subject": "Hi",
                                "body": "Hello there.",
                            },
                            "id": "call_email_1",
                            "type": "tool_call",
                        }
                    ],
                )
            else:
                msg = AIMessage(content="Done. I planned the work and sent the email after your approval.")
            return ChatResult(generations=[ChatGeneration(message=msg)])

        # default scenario: plan, then answer
        if "write_todos" not in done:
            msg = AIMessage(
                content="",
                tool_calls=[
                    {
                        "name": "write_todos",
                        "args": {
                            "todos": [
                                {"content": "Understand the request", "status": "pending"},
                                {"content": "Produce the answer", "status": "pending"},
                            ]
                        },
                        "id": "call_todos_1",
                        "type": "tool_call",
                    }
                ],
            )
        else:
            msg = AIMessage(content="Here is the answer to your request.")
        return ChatResult(generations=[ChatGeneration(message=msg)])
