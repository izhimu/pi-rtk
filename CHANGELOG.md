# Changelog

All notable changes to `@izhimu/pi-rtk` will be documented in this file.

## [0.1.6] - 2026-09-17

### Performance & Host Adaptations
- **Eliminated Barrel Import Overhead**: Replaced `@earendil-works/pi-coding-agent` value export `isToolCallEventType` with local type guard `isCommandToolCallEvent`, dropping extension load time from ~250ms to ~10ms (aligned with upstream rtk #2753).
- **PowerShell Tool Support (Pi)**: Extended tool call interception to include Pi's newly introduced `powershell` tool (PR #8512), enabling transparent command rewriting on Windows.
- **Session Status Reporting (Pi & OMP)**: Added persistent `RTK disabled: <reason>` status notification on `session_start` for runtimes supporting `ctx.ui.setStatus` (such as Oh My Pi) when RTK binary is missing or below minimum required version.
- **Safe Lifecycle Compliance (OMP)**: Guarded load-phase execution against calling uninitialized runtime actions, avoiding `ExtensionRuntimeNotInitializedError` in OMP's Bun runtime.
## [0.1.5] - 2026-08-21

### Changed & Improved
- **Zero-Overhead Transparent Rewrite**: Removed redundant bottom status bar and prompt skills to keep prompt overhead at zero; the model works naturally with raw shell commands while RTK rewrites them transparently.
- **Protocol Compliance**: Standardized `pi.sendMessage` payload structure (`customType: "rtk-status"`, `display: true`) for seamless compatibility with both Pi and Oh My Pi runtimes.
- **Type Checking**: Added `typecheck` script and type definitions to repository tooling.

## [0.1.4] - 2026-08-16

### Changed
- Refined UI status display styling and bowtie icon integration.

## [0.1.3] - 2026-08-16

### Changed
- Updated token savings status display.

## [0.1.2] - 2026-08-16

### Added
- Added live token savings status updates and baseline tracking.

## [0.1.1] - 2026-07-15

### Changed
- Consolidated RTK gain queries and command argument completions.

## [0.1.0] - 2026-07-15

### Added
- Initial release of `@izhimu/pi-rtk` for Pi and Oh My Pi coding agents.
- Transparent shell command rewriting via `rtk rewrite` on `bash` tool calls (60–90% token savings).
- Interactive slash commands: `/rtk` (toggle on/off) and `/rtk-status` (view project/global savings).
- Fail-open safety design and minimum RTK version guard (`rtk >= 0.23.0`).
