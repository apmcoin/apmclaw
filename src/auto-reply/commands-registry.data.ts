import { getActivePluginRegistry } from "../plugins/runtime.js";
import type {
  ChatCommandDefinition,
  CommandCategory,
  CommandScope,
} from "./commands-registry.types.js";

type DefineChatCommandInput = {
  key: string;
  nativeName?: string;
  description: string;
  args?: ChatCommandDefinition["args"];
  argsParsing?: ChatCommandDefinition["argsParsing"];
  acceptsArgs?: boolean;
  textAlias?: string;
  textAliases?: string[];
  scope?: CommandScope;
  category?: CommandCategory;
};

function defineChatCommand(command: DefineChatCommandInput): ChatCommandDefinition {
  const aliases = (command.textAliases ?? (command.textAlias ? [command.textAlias] : []))
    .map((alias) => alias.trim())
    .filter(Boolean);
  const scope =
    command.scope ?? (command.nativeName ? (aliases.length ? "both" : "native") : "text");
  const acceptsArgs = command.acceptsArgs ?? Boolean(command.args?.length);
  const argsParsing = command.argsParsing ?? (command.args?.length ? "positional" : "none");
  return {
    key: command.key,
    nativeName: command.nativeName,
    description: command.description,
    acceptsArgs,
    args: command.args,
    argsParsing,
    textAliases: aliases,
    scope,
    category: command.category,
  };
}

function buildChatCommands(): ChatCommandDefinition[] {
  return [
    defineChatCommand({
      key: "menu",
      nativeName: "menu",
      description: "apM official links",
      textAliases: ["/menu"],
      category: "info",
    }),
    // /reset: admin-only, not registered in Telegram menu.
    // Handled as text command only.
    defineChatCommand({
      key: "reset",
      description: "admin menu",
      textAliases: ["/reset"],
      scope: "text",
      category: "session",
    }),
  ];
}

export function getChatCommands(): ChatCommandDefinition[] {
  const registry = getActivePluginRegistry();
  return buildChatCommands();
}

export function getNativeCommandSurfaces(): Set<string> {
  return new Set(["telegram"]);
}
