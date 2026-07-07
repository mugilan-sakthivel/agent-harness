"""Example tools for the harness.

Includes a safe read-only tool (web_search stub) and two "sensitive" tools
(send_email, delete_resource) that we gate behind human-in-the-loop interrupts
so the HITL flow can be exercised end to end.
"""

from __future__ import annotations

from langchain_core.tools import tool


@tool
def web_search(query: str) -> str:
    """Search the web for a query and return a short text summary.

    This is a deterministic stub so the harness is testable offline without
    paid search keys. Swap the body for Tavily/Exa/Brave in production.
    """
    return (
        f"[stub search results for: {query!r}]\n"
        "1. Overview article about the topic.\n"
        "2. A primary source with key figures.\n"
        "3. A recent discussion thread."
    )


@tool
def send_email(to: str, subject: str, body: str) -> str:
    """Send an email. SENSITIVE: gated behind human approval."""
    return f"Email sent to {to} with subject {subject!r} ({len(body)} chars)."


@tool
def delete_resource(resource_id: str) -> str:
    """Permanently delete a resource by id. SENSITIVE: gated behind human approval."""
    return f"Resource {resource_id!r} deleted."


# Tools that should pause for human review before executing.
SENSITIVE_TOOLS = ["send_email", "delete_resource"]

ALL_TOOLS = [web_search, send_email, delete_resource]
