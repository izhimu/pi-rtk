---
name: rtk
description: >
  RTK (Rust Token Killer) integration. Transparent command rewriting that reduces
  LLM token consumption by 60-90%. Commands are automatically rewritten to use rtk
  equivalents. Use /rtk to toggle, /rtk-status for savings stats.

# RTK — Token Savings

RTK transparently rewrites shell commands to their `rtk`-prefixed equivalents,
filtering and compressing output before it reaches LLM context. Single Rust binary,
100+ supported commands, <10ms overhead.

## How It Works

When you run a command like `git status`, RTK intercepts it and rewrites to
`rtk git status`. The RTK version filters verbose output, keeping only what
matters — saving 60-90% tokens.

**Examples:**
- `git status` → `rtk git status` (80% savings)
- `cargo test` → `rtk cargo test` (90% savings)
- `npm test` → `rtk npm test` (90% savings)
- `git diff` → `rtk git diff` (75% savings)

## Supported Categories

| Category | Examples | Savings |
|----------|----------|---------|
| Test runners | vitest, pytest, cargo test, go test, playwright | 90-99% |
| Build tools | cargo build, npm, pnpm, dotnet, make | 70-90% |
| VCS | git status/log/diff/show | 70-80% |
| Language servers | tsc, mypy | 80-83% |
| Linters | eslint, ruff, golangci-lint, biome | 80-85% |
| Package managers | pip, cargo install, pnpm list | 75-80% |
| File operations | ls, find, grep, cat, head, tail | 60-75% |
| Infrastructure | docker, kubectl, aws, terraform | 75-85% |

## Commands

- `/rtk` — show status (on/off, version, rewrite count)
- `/rtk on` / `/rtk off` — toggle rewriting
- `/rtk-status` — show project-scoped savings (`rtk gain -p`)
- `/rtk-status global` — show global savings (`rtk gain`)

## Override

- `RTK_DISABLED=1` prefix skips rewriting for one command
- Already-prefixed `rtk ...` commands pass through unchanged

## When NOT to Use RTK

RTK is always safe to leave enabled. It never blocks commands — all error paths
pass through. If a rewrite seems wrong, use `RTK_DISABLED=1` to bypass.
