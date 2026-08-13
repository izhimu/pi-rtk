---
name: rtk
description: >
  RTK (Rust Token Killer) integration. Transparent command rewriting that reduces
  LLM token consumption by 60-90%. Commands are automatically rewritten to use rtk
  equivalents. Use /rtk to toggle, /rtk-status for savings stats.
---

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
| Files | ls, read, find, grep, diff | 60-75% |
| Git | git status/log/diff/add/commit/push/pull | 70-80% |
| GitHub CLI | gh pr/issue list, gh pr view, gh run list | 70-80% |
| Test runners | jest, vitest, playwright, pytest, cargo test, go test, rspec | 90-99% |
| Build & Lint | eslint, biome, tsc, cargo build/clippy, ruff, golangci-lint, rubocop | 70-90% |
| Package managers | pnpm list, pip list, bundle install, prisma generate | 75-80% |
| AWS | sts, ec2, lambda, logs, cloudformation, dynamodb, iam, s3 | 75-85% |
| Containers | docker ps/images/logs, kubectl pods/logs/services, OpenShift | 75-85% |
| Infrastructure as Code | pulumi preview/up/destroy/refresh/stack | 70-80% |
| Data & Analytics | json, deps, env, log, curl, wget, summary | 60-75% |
| Token analytics | rtk gain, rtk discover, rtk session | — |

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
