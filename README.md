# pi-rtk

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![pi extension](https://img.shields.io/badge/pi-extension-green.svg)](https://github.com/earendil-works/pi)

RTK (Rust Token Killer) integration for [pi](https://github.com/earendil-works/pi) — transparent command rewriting that reduces LLM token consumption by **60-90%**.

Upstream: [rtk-ai/rtk](https://github.com/rtk-ai/rtk)

## Features

- **Transparent rewriting** — shell commands automatically use `rtk` equivalents, no workflow changes
- **60-90% token savings** — tested across 100+ command categories
- **Zero overhead** — single Rust binary, <10ms rewrite latency
- **Status bar integration** — live savings indicator with color-coded display
- **Toggle on/off** — `/rtk on` / `/rtk off` without restarting
- **Session stats** — track rewrites, passthroughs, and errors per session
- **Safe by default** — all error paths pass through, RTK never blocks execution

## Install

### npm (recommended)

```bash
pi install @izhimu/pi-rtk
```

### From git

```bash
# Global
pi install git:github.com/izhimu/pi-rtk

# Project-local (shared with team via .pi/settings.json)
pi install git:github.com/izhimu/pi-rtk -l
```

### From local path

```bash
pi install /path/to/pi-rtk
pi install ./relative/path/to/pi-rtk
```

### Quick test (no install)

```bash
pi -e ./extensions/rtk.ts
```

## Commands

| Command | Effect |
|---------|--------|
| `/rtk` | Show status (on/off, version, rewrite count) |
| `/rtk on` | Enable rewriting |
| `/rtk off` | Disable rewriting |
| `/rtk-status` | Show project-scoped token savings |
| `/rtk-status global` | Show global token savings |

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

## Examples

```bash
# Before: 2.4k tokens
git status

# After: ~480 tokens (80% savings)
rtk git status

# Before: 8k tokens
cargo test

# After: ~800 tokens (90% savings)
rtk cargo test
```

## Requirements

- `rtk >= 0.23.0` in PATH
- Install: `brew install rtk` or see [rtk installation](https://github.com/rtk-ai/rtk#installation)

## How It Works

1. Extension loads, probes `rtk --version` (disables if missing or too old)
2. Subscribes to `tool_call` events, narrows to `bash` tool
3. Calls `rtk rewrite <command>` for each shell command
4. If rewrite differs, mutates command in-place
5. All error paths pass through — RTK never blocks execution

## Override

- `RTK_DISABLED=1` prefix skips rewriting for one command
- Already-prefixed `rtk ...` commands pass through unchanged

## Project Structure

```
pi-rtk/
├── extensions/
│   └── rtk.ts            # pi ExtensionAPI integration
├── skills/
│   └── rtk/
│       └── SKILL.md      # RTK behavior rules
├── package.json          # pi package manifest
├── tsconfig.json
├── LICENSE
└── README.md
```

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## License

[Apache-2.0](LICENSE) © [izhimu](https://github.com/izhimu)
