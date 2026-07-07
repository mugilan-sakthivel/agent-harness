"""Optional MCP tool loading.

Reads an optional ``mcp.json`` next to ``langgraph.json``. If present, connects
to the configured MCP servers and returns their tools. Best-effort: any failure
logs a warning and returns an empty list so a bad MCP config can never take the
whole harness down. Reliability over features.

mcp.json shape (same as langchain-mcp-adapters MultiServerMCPClient):

    {
      "servers": {
        "filesystem": {
          "command": "npx",
          "args": ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"],
          "transport": "stdio"
        },
        "example-http": {
          "url": "http://localhost:8931/mcp",
          "transport": "streamable_http"
        }
      }
    }
"""

from __future__ import annotations

import asyncio
import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

_MCP_CONFIG = Path(__file__).resolve().parents[2] / "mcp.json"


def load_mcp_tools() -> list:
    if not _MCP_CONFIG.exists():
        return []
    try:
        config = json.loads(_MCP_CONFIG.read_text())
        servers = config.get("servers", {})
        if not servers:
            return []
        from langchain_mcp_adapters.client import MultiServerMCPClient

        client = MultiServerMCPClient(servers)
        tools = asyncio.run(client.get_tools())
        logger.info("Loaded %d MCP tool(s) from %d server(s)", len(tools), len(servers))
        return tools
    except Exception as exc:  # noqa: BLE001 - never let MCP break the agent
        logger.warning("MCP tools unavailable, continuing without them: %s", exc)
        return []
