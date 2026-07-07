"""The deep-agent harness graph.

Exposes ``graph`` for the LangGraph server (langgraph.json). When served by the
LangGraph platform/dev server, persistence (checkpointer + store) is injected by
the runtime, so we do NOT attach our own checkpointer here -- doing so conflicts
with the platform. For standalone scripts use ``build_agent(checkpointer=...)``.
"""

from __future__ import annotations

from dotenv import load_dotenv

from deepagents import create_deep_agent

from .mcp import load_mcp_tools
from .models import get_model
from .tools import ALL_TOOLS, SENSITIVE_TOOLS, web_search

load_dotenv()


SYSTEM_PROMPT = """You are a reliable deep-agent assistant.

Working style:
- For any multi-step task, FIRST call write_todos to lay out a plan, then work \
through the items, updating their status as you go.
- Delegate focused research to the `research-agent` subagent via the task tool \
when a question needs gathering and summarizing information.
- Use the filesystem tools to save intermediate artifacts when useful.
- Some tools (send_email, delete_resource) require human approval; call them \
normally and the system will pause for the user.

Be concise and concrete in your final answers."""


RESEARCH_SUBAGENT = {
    "name": "research-agent",
    "description": (
        "Delegate focused research questions here. It gathers information and "
        "returns a concise written summary."
    ),
    "system_prompt": (
        "You are a focused researcher. Use web_search to gather information and "
        "return a tight, well-organized summary with the key facts."
    ),
    "tools": [web_search],
}


def build_agent(checkpointer=None):
    """Build the deep agent. Pass a checkpointer for standalone use."""
    tools = list(ALL_TOOLS) + load_mcp_tools()
    interrupt_on = {
        name: {"allowed_decisions": ["approve", "edit", "reject", "respond"]}
        for name in SENSITIVE_TOOLS
    }
    return create_deep_agent(
        model=get_model(),
        tools=tools,
        system_prompt=SYSTEM_PROMPT,
        subagents=[RESEARCH_SUBAGENT],
        interrupt_on=interrupt_on,
        checkpointer=checkpointer,
    )


# Graph for the LangGraph server. Persistence is injected by the runtime.
graph = build_agent()
