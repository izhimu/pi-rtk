// pi-rtk — pi extension
//
// RTK integration for pi: transparent command rewriting, token savings tracking.
//
// Requires: rtk >= 0.23.0 in PATH.
// Upstream: https://github.com/rtk-ai/rtk

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { isToolCallEventType } from "@earendil-works/pi-coding-agent";

// ── Constants ───────────────────────────────────────────────────────────────

const REWRITE_TIMEOUT_MS = 2_000;
const MIN_SUPPORTED_RTK_MINOR = 23;

// ── Display helpers ─────────────────────────────────────────────────────────

const ESC = "\x1b[";
const RST = `${ESC}0m`;
const DIM = `${ESC}2m`;
const BOLD = `${ESC}1m`;
const GREEN = `${ESC}32m`;
const YELLOW = `${ESC}33m`;
const RED = `${ESC}31m`;

function bar(pct: number, width = 20): string {
  const filled = Math.round((pct / 100) * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
}

// ── Session stats ───────────────────────────────────────────────────────────

interface SessionStats {
  rewrites: number;
  passthrough: number;
  errors: number;
}

interface RtkGainSummary {
  total_commands: number;
  total_input: number;
  total_output: number;
  total_saved: number;
  avg_savings_pct: number;
}

let sessionStats: SessionStats = { rewrites: 0, passthrough: 0, errors: 0 };
let rtkEnabled = true;
let rtkVersion: string | null = null;

// ── Semver helpers ──────────────────────────────────────────────────────────

function parseSemver(raw: string): [number, number, number] | null {
  const m = raw.trim().match(/(\d+)\.(\d+)\.(\d+)/);
  if (!m) return null;
  return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
}

// ── RTK gain query ─────────────────────────────────────────────────────────

async function fetchRtkGain(pi: ExtensionAPI, project = true): Promise<RtkGainSummary | null> {
  try {
    const args = ["gain", "--format", "json"];
    if (project) args.push("-p");
    const result = await pi.exec("rtk", args, { timeout: 3_000 });
    if (result.code !== 0) return null;
    return JSON.parse(result.stdout.trim()).summary;
  } catch {
    return null;
  }
}

// ── RTK rewrite ─────────────────────────────────────────────────────────────

async function rewriteCommand(
  pi: ExtensionAPI,
  cmd: string,
  signal?: AbortSignal,
): Promise<string | null> {
  const result = await pi.exec("rtk", ["rewrite", cmd], {
    timeout: REWRITE_TIMEOUT_MS,
    signal,
  });
  if (result.killed) return null;
  if (result.code !== 0 && result.code !== 3) return null;
  return result.stdout.trim() || null;
}

export default async function rtkExtension(pi: ExtensionAPI) {
  // ── Version probe ──────────────────────────────────────────────────────
  const ver = await pi.exec("rtk", ["--version"], { timeout: REWRITE_TIMEOUT_MS });
  if (ver.code !== 0) {
    console.warn("[rtk] rtk binary not found in PATH — extension disabled");
    return;
  }

  const versionStr = ver.stdout.trim().replace(/^rtk\s+/, "");
  rtkVersion = versionStr;

  const parsed = parseSemver(versionStr);
  if (parsed) {
    const [major, minor] = parsed;
    if (major === 0 && minor < MIN_SUPPORTED_RTK_MINOR) {
      console.warn(
        `[rtk] rtk ${ver.stdout.trim()} is too old (need >= 0.23.0) — extension disabled`,
      );
      return;
    }
  }

  // ── Session reset ─────────────────────────────────────────────────────
  pi.on("session_start", async () => {
    sessionStats = { rewrites: 0, passthrough: 0, errors: 0 };
    rtkEnabled = true;
  });

  pi.on("tool_call", async (event, ctx) => {
    try {
      if (!rtkEnabled) return;
      if (!isToolCallEventType("bash", event)) return;

      const cmd = event.input.command;
      if (typeof cmd !== "string" || cmd.trim() === "") return;
      if (cmd.startsWith("rtk ")) return;
      if (process.env.RTK_DISABLED === "1") return;

      const rewritten = await rewriteCommand(pi, cmd, ctx.signal);
      if (rewritten && rewritten !== cmd) {
        event.input.command = rewritten;
        sessionStats.rewrites++;
      } else {
        sessionStats.passthrough++;
      }
    } catch (err) {
      sessionStats.errors++;
      console.warn("[rtk] unexpected error in tool_call handler; passing through", err);
    }
  });
  // ── Argument completions ─────────────────────────────────────────────
  const RTK_CHOICES = [
    { value: "on",     label: "on",     description: "enable command rewriting" },
    { value: "off",    label: "off",    description: "disable command rewriting" },
    { value: "status", label: "status", description: "show current status" },
  ];

  function getRtkCompletions(prefix: string) {
    const lower = prefix.toLowerCase();
    return RTK_CHOICES.filter(m => m.value.startsWith(lower)) || null;
  }

  // ── /rtk command — toggle on/off ───────────────────────────────────────
  pi.registerCommand("rtk", {
    description: "Toggle RTK command rewriting (on|off|status)",
    getArgumentCompletions: (prefix) => getRtkCompletions(prefix),
    handler: async (args, ctx) => {
      const arg = (args || "").trim().toLowerCase();

      if (!arg || arg === "status") {
        const status = rtkEnabled ? `${GREEN}ON${RST}` : `${RED}OFF${RST}`;
        const ver = rtkVersion ? `v${rtkVersion}` : "unknown";
        const total = sessionStats.rewrites + sessionStats.passthrough;
        const msg = [
          `${BOLD}RTK${RST}: ${status} ${DIM}(${ver})${RST}`,
          "",
          ` ${sessionStats.rewrites} rewritten ${DIM}│${RST} ${sessionStats.passthrough} passed ${DIM}│${RST} ${total} total`,
        ].join("\n");
        if (ctx.hasUI) ctx.ui.notify(msg, "info");
        return;
      }

      if (arg === "on" || arg === "enable") {
        rtkEnabled = true;
        if (ctx.hasUI) ctx.ui.notify("RTK enabled", "info");
        return;
      }

      if (arg === "off" || arg === "disable") {
        rtkEnabled = false;
        if (ctx.hasUI) ctx.ui.notify("RTK disabled", "info");
        return;
      }

      if (ctx.hasUI) {
        ctx.ui.notify(`unknown arg "${arg}". Use: on|off|status`, "warning");
      }
    },
  });
  // ── /rtk-status completions ──────────────────────────────────────────
  const STATUS_CHOICES = [
    { value: "global", label: "global", description: "show global savings (all projects)" },
  ];

  function getStatusCompletions(prefix: string) {
    const lower = prefix.toLowerCase();
    return STATUS_CHOICES.filter(m => m.value.startsWith(lower)) || null;
  }

  // ── /rtk-status command — show savings ───────────────────────────────────
  pi.registerCommand("rtk-status", {
    description: "Show RTK token savings (project-scoped, or 'global' for all)",
    getArgumentCompletions: (prefix) => getStatusCompletions(prefix),
    handler: async (args, ctx) => {
      const arg = (args || "").trim().toLowerCase();
      const total = sessionStats.rewrites + sessionStats.passthrough;
      const rate = total > 0 ? Math.round((sessionStats.rewrites / total) * 100) : 0;
      const status = rtkEnabled ? `${GREEN}ON${RST}` : `${RED}OFF${RST}`;
      const ver = rtkVersion ? `v${rtkVersion}` : "unknown";

      const lines: string[] = [
        `${BOLD}RTK${RST}: ${status} ${DIM}(${ver})${RST}`,
        "",
        ` ${sessionStats.rewrites} rewritten ${DIM}│${RST} ${sessionStats.passthrough} passed ${DIM}│${RST} ${total} total`,
      ];

      if (sessionStats.errors > 0) {
        lines.push(
          ` ${YELLOW}${sessionStats.errors}${RST} errors`,
        );
      }
      const savings = await fetchRtkGain(pi, arg !== "global");
      if (savings && savings.total_saved > 0) {
        const pct = Math.round(savings.avg_savings_pct);
        lines.push(
          "",
          ` saved ${GREEN}${savings.total_saved.toLocaleString()}${RST} tokens ${DIM}(~${pct}%, ${savings.total_commands} cmds)${RST}  ${GREEN}${bar(pct)}${RST}`,
        );
      }

      lines.push(
        "",
        arg === "global"
          ? `${DIM}Run 'rtk gain' for full global report${RST}`
          : `${DIM}Run 'rtk gain -p' for project details, 'rtk gain' for global${RST}`,
      );

      const msg = lines.join("\n");
      if (ctx.hasUI) ctx.ui.notify(msg, "info");
      pi.sendMessage(
        {
          content: msg,
          attribution: "user",
        },
        { triggerTurn: false },
      );
    },
  });

}
