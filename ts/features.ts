#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

// Tool definitions remain the same but use template literals for multi-line descriptions
const PERPLEXITY_ASK_TOOL: Tool = {
  name: "perplexity_ask",
  description: `Engages in a conversation using the Sonar API.
Accepts an array of messages (each with a role and content)
and returns a ask completion response from the Perplexity model.`,
  inputSchema: {
    type: "object",
    properties: {
      messages: {
        type: "array",
        items: {
          type: "object",
          properties: {
            role: { type: "string" },
            content: { type: "string" },
          },
          required: ["role", "content"],
        },
      },
    },
    required: ["messages"],
  },
};

const PERPLEXITY_RESEARCH_TOOL: Tool = {
  name: "perplexity_research",
  description: `Performs deep research using the Perplexity API.
Accepts an array of messages (each with a role and content)
and returns a comprehensive research response with citations.`,
  inputSchema: { /* same structure as ASK_TOOL */ },
};

const PERPLEXITY_REASON_TOOL: Tool = {
  name: "perplexity_reason",
  description: `Performs reasoning tasks using the Perplexity API.
Accepts an array of messages (each with a role and content)
and returns a well-reasoned response using the sonar-reasoning-pro model.`,
  inputSchema: { /* same structure as ASK_TOOL */ },
};

// Environment check with better error message
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY?.trim();
if (!PERPLEXITY_API_KEY) {
  console.error("[ERROR] Missing required environment variable: PERPLEXITY_API_KEY");
  process.exit(1);
}

// Enhanced error handling with status codes
async function performChatCompletion(
  messages: Array<{ role: string; content: string }>,
  model = "sonar-pro"
): Promise<string> {
  const API_ENDPOINT = "https://api.perplexity.ai/chat/completions";
  
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({ model, messages }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API Error ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;

    if (data.citations?.length) {
      content += "\n\nCitations:\n" + 
        data.citations.map((c: string, i: number) => `[${i + 1}] ${c}`).join("\n");
    }

    return content;
  } catch (error) {
    throw new Error(`Chat completion failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Server configuration with explicit types
const server = new Server(
  {
    name: "perplexity-tools-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {
        [PERPLEXITY_ASK_TOOL.name]: PERPLEXITY_ASK_TOOL,
        [PERPLEXITY_RESEARCH_TOOL.name]: PERPLEXITY_RESEARCH_TOOL,
        [PERPLEXITY_REASON_TOOL.name]: PERPLEXITY_REASON_TOOL,
      },
    },
  }
);

// Enhanced tool handlers with type guards
server.setRequestHandler(ListToolsRequestSchema, () => ({
  tools: [PERPLEXITY_ASK_TOOL, PERPLEXITY_RESEARCH_TOOL, PERPLEXITY_REASON_TOOL],
}));

server.setRequestHandler(CallToolRequestSchema, async ({ params }) => {
  try {
    const { name, arguments: args } = params;
    
    if (!args?.messages || !Array.isArray(args.messages)) {
      throw new Error("Invalid message format");
    }

    const messages = args.messages as Array<{ role: string; content: string }>;
    let model: string;

    switch (name) {
      case "perplexity_ask":
        model = "sonar-pro";
        break;
      case "perplexity_research":
        model = "sonar-deep-research";
        break;
      case "perplexity_reason":
        model = "sonar-reasoning-pro";
        break;
      default:
        return { 
          content: [{ type: "text", text: `Unsupported tool: ${name}` }], 
          isError: true 
        };
    }

    const result = await performChatCompletion(messages, model);
    return { content: [{ type: "text", text: result }], isError: false };

  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Tool execution failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      }],
      isError: true,
    };
  }
});

// Server initialization with cleanup handlers
async function bootstrap() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.error("[INFO] Server started successfully");
    process.on("SIGINT", () => {
      console.error("\n[INFO] Shutting down server");
      process.exit(0);
    });
  } catch (error) {
    console.error("[FATAL] Server initialization failed:", error);
    process.exit(1);
  }
}

bootstrap();