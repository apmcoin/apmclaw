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
      key: "reset",
      nativeName: "reset",
      description: "admin menu",
      textAliases: ["/reset"],
      category: "session",
    }),
    defineChatCommand({
      key: "about",
      nativeName: "about",
      description: "about apM project",
      textAliases: ["/about"],
      category: "info",
    }),
    defineChatCommand({
      key: "website",
      nativeName: "website",
      description: "official website",
      textAliases: ["/website"],
      category: "info",
    }),
    defineChatCommand({
      key: "whitepaper",
      nativeName: "whitepaper",
      description: "whitepaper",
      textAliases: ["/whitepaper"],
      category: "info",
    }),
    defineChatCommand({
      key: "etherscan",
      nativeName: "etherscan",
      description: "token contract",
      textAliases: ["/etherscan"],
      category: "info",
    }),
    defineChatCommand({
      key: "medium",
      nativeName: "medium",
      description: "blog & articles",
      textAliases: ["/medium"],
      category: "info",
    }),
    defineChatCommand({
      key: "x",
      nativeName: "x",
      description: "X (Twitter)",
      textAliases: ["/x"],
      category: "info",
    }),
    defineChatCommand({
      key: "roll",
      nativeName: "roll",
      description: "roll the dice",
      textAliases: ["/roll"],
      category: "fun",
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
