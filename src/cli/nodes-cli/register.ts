import type { Command } from "commander";

// Device control (nodes CLI) removed in apM Claw - Telegram bot doesn't need camera/canvas/screen control
export function registerNodesCli(program: Command) {
  // Disabled: nodes command not needed for Telegram community management
}
