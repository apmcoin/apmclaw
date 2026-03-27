import { getActivePluginRegistry } from "../plugins/runtime.js";
import { ChatCommandDefinition } from "./commands-registry.types.js";

/**
 * apM Claw Zero-Command Policy:
 * All native chat commands have been physically removed to minimize the attack surface.
 * The bot operates entirely via ambient AI analysis and context-aware interaction.
 */

function buildChatCommands(): ChatCommandDefinition[] {
  // No commands defined. This is a command-less, context-driven bot.
  return [];
}

export function getChatCommands(): ChatCommandDefinition[] {
  const registry = getActivePluginRegistry();
  const commands = buildChatCommands();
  return commands;
}

export function getNativeCommandSurfaces(): Set<string> {
  // Disable all command surfaces.
  return new Set([]);
}
