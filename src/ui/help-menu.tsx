import React, { useState } from "react";
import { Box, Text } from "ink";
import SelectInput from "ink-select-input";
import type { Theme } from "./theme.js";

interface Props {
  theme: Theme;
  onDone: () => void;
}

type Page =
  | "main"
  | "mode"
  | "thinking"
  | "theme"
  | "session"
  | "memory"
  | "mcp"
  | "gateway"
  | "info"
  | "config";

interface CommandEntry {
  command: string;
  description: string;
}

interface Category {
  key: Page;
  label: string;
  commands: CommandEntry[];
}

const CATEGORIES: Category[] = [
  {
    key: "mode",
    label: "Mode",
    commands: [
      { command: "/mode edit|plan|auto", description: "switch mode (or shift+tab to cycle)" },
      { command: "/plan", description: "shortcut for /mode plan" },
      { command: "/auto", description: "shortcut for /mode auto" },
      { command: "/edit", description: "shortcut for /mode edit" },
    ],
  },
  {
    key: "thinking",
    label: "Thinking",
    commands: [
      { command: "/thinking low|medium|high", description: "set reasoning effort (quality vs speed)" },
    ],
  },
  {
    key: "theme",
    label: "Theme",
    commands: [
      { command: "/theme", description: "interactive theme picker (or ctrl+t)" },
      { command: "/theme NAME", description: "set theme by name" },
    ],
  },
  {
    key: "session",
    label: "Session",
    commands: [
      { command: "/resume", description: "pick a past conversation" },
      { command: "/compact", description: "summarize old turns to free context" },
      { command: "/clear", description: "clear current conversation" },
    ],
  },
  {
    key: "memory",
    label: "Memory",
    commands: [
      { command: "/memory", description: "show memory stats" },
      { command: "/memory on", description: "enable memory" },
      { command: "/memory off", description: "disable memory" },
      { command: "/memory search <query>", description: "search stored memories" },
      { command: "/memory clear", description: "wipe memories for this repo" },
    ],
  },
  {
    key: "mcp",
    label: "MCP",
    commands: [
      { command: "/mcp list", description: "list connected MCP servers and tools" },
      { command: "/mcp reload", description: "reconnect all configured MCP servers" },
    ],
  },
  {
    key: "gateway",
    label: "Gateway",
    commands: [
      { command: "/gateway", description: "show gateway status" },
      { command: "/gateway ID", description: "enable AI Gateway" },
      { command: "/gateway off", description: "disable AI Gateway (direct Workers AI)" },
      { command: "/gateway cache-ttl N", description: "set gateway cache TTL in seconds" },
      { command: "/gateway skip-cache T|F", description: "set gateway skip-cache flag" },
      { command: "/gateway collect-logs T|F", description: "include payload in gateway logs" },
      { command: "/gateway metadata K=V", description: "add metadata key-value pair" },
      { command: "/gateway metadata clear", description: "remove all metadata" },
    ],
  },
  {
    key: "info",
    label: "Info",
    commands: [
      { command: "/cost", description: "show cost report" },
      { command: "/model", description: "show current model" },
      { command: "/update", description: "check for updates" },
      { command: "/hello", description: "send a voice note to the creator" },
      { command: "/community", description: "join our Discord server" },
    ],
  },
  {
    key: "config",
    label: "Config",
    commands: [
      { command: "/init", description: "scan this repo and write a KIMI.md for future agents" },
      { command: "/logout", description: "clear credentials" },
    ],
  },
];

const SINGLE_COMMANDS: CommandEntry[] = [
  { command: "/reasoning", description: "toggle show/hide model reasoning" },
  { command: "/help", description: "show this menu" },
  { command: "/exit", description: "exit kimiflare" },
];

export function HelpMenu({ theme, onDone }: Props) {
  const [page, setPage] = useState<Page>("main");

  if (page === "main") {
    const items = CATEGORIES.map((cat) => ({
      label: `${cat.label}`,
      value: cat.key,
      key: cat.key,
    }));
    items.push({ label: "(close)", value: "__close__", key: "__close__" });

    return (
      <Box flexDirection="column" borderStyle="round" borderColor={theme.accent} paddingX={1}>
        <Text color={theme.accent} bold>
          Help
        </Text>
        <Text color={theme.info.color} dimColor={false}>
          Arrow keys to navigate, Enter to select.
        </Text>
        <Box marginTop={1}>
          <SelectInput
            items={items}
            onSelect={(item) => {
              if (item.value === "__close__") {
                onDone();
              } else {
                setPage(item.value as Page);
              }
            }}
          />
        </Box>
        <Box marginTop={1} flexDirection="column">
          {SINGLE_COMMANDS.map((cmd) => (
            <Text key={cmd.command} color={theme.info.color} dimColor={false}>
              {`  ${cmd.command.padEnd(20)} ${cmd.description}`}
            </Text>
          ))}
        </Box>
        <Box marginTop={1}>
          <Text color={theme.info.color} dimColor={false}>
            keys: ctrl-c interrupt/exit · ctrl-r toggle reasoning · ctrl-o verbose · ctrl+t theme · shift+tab cycle mode · ↑/↓ history
          </Text>
        </Box>
      </Box>
    );
  }

  const category = CATEGORIES.find((c) => c.key === page)!;
  const items = category.commands.map((cmd) => ({
    label: `${cmd.command.padEnd(28)} ${cmd.description}`,
    value: cmd.command,
    key: cmd.command,
  }));
  items.push({ label: "← Back", value: "__back__", key: "__back__" });

  return (
    <Box flexDirection="column" borderStyle="round" borderColor={theme.accent} paddingX={1}>
      <Text color={theme.accent} bold>
        {category.label}
      </Text>
      <Text color={theme.info.color} dimColor={false}>
        Arrow keys to navigate, Enter to go back.
      </Text>
      <Box marginTop={1}>
        <SelectInput
          items={items}
          onSelect={(item) => {
            if (item.value === "__back__") {
              setPage("main");
            }
          }}
        />
      </Box>
    </Box>
  );
}
