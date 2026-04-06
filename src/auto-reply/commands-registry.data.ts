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

// apM Claw 필수 커맨드만 등록 (Telegram 네이티브 메뉴 + 텍스트)
function buildChatCommands(): ChatCommandDefinition[] {
  return [
    defineChatCommand({
      key: "help",
      nativeName: "help",
      description: "사용 가능한 명령어를 표시합니다.",
      textAlias: "/help",
      category: "status",
    }),
    defineChatCommand({
      key: "status",
      nativeName: "status",
      description: "현재 상태를 표시합니다.",
      textAlias: "/status",
      category: "status",
    }),
    defineChatCommand({
      key: "new",
      nativeName: "new",
      description: "새 대화를 시작합니다.",
      textAliases: ["/new", "/reset"],
      category: "session",
    }),
    defineChatCommand({
      key: "whoami",
      nativeName: "whoami",
      description: "내 정보를 표시합니다.",
      textAlias: "/whoami",
      category: "status",
    }),
    defineChatCommand({
      key: "context",
      nativeName: "context",
      description: "컨텍스트 정보를 표시합니다.",
      textAlias: "/context",
      acceptsArgs: true,
      category: "status",
    }),
    defineChatCommand({
      key: "commands",
      nativeName: "commands",
      description: "전체 명령어 목록을 표시합니다.",
      textAlias: "/commands",
      category: "status",
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
