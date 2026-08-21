# Changelog

All notable changes to `@izhimu/pi-rtk` will be documented in this file.

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
