import { test } from "node:test";
import assert from "node:assert/strict";

function makeMockPi(version) {
  const handlers = new Map();
  const execCalls = [];
  return {
    handlers,
    execCalls,
    on(event, handler) {
      handlers.set(event, handler);
    },
    registerCommand() {},
    sendMessage() {},
    async exec(command, args) {
      execCalls.push({ command, args });
      if (args[0] === "--version") {
        return { code: 0, stdout: `rtk ${version}`, stderr: "", killed: false };
      }
      return { code: 3, stdout: "rtk git status", stderr: "", killed: false };
    },
  };
}

async function loadExtension(version) {
  const moduleUrl = `../extensions/rtk.ts?test=${encodeURIComponent(version)}`;
  const { default: rtkExtension } = await import(moduleUrl);
  const pi = makeMockPi(version);
  await rtkExtension(pi);
  return pi;
}

test("version guard requires the RTK release that introduced rewrite", async () => {
  const oldPi = await loadExtension("0.24.0");
  assert.equal(oldPi.handlers.has("tool_call"), false);

  const supportedPi = await loadExtension("0.25.0");
  assert.equal(supportedPi.handlers.has("tool_call"), true);
});

test("tool_call supports Pi mutation and the OMP input revision contract", async () => {
  const savedDisabled = process.env.RTK_DISABLED;
  delete process.env.RTK_DISABLED;
  try {
    const pi = await loadExtension("1.2.0");
    const event = { type: "tool_call", toolName: "bash", input: { command: "git status" } };
    const result = await pi.handlers.get("tool_call")(event, { signal: undefined });

    assert.deepEqual(pi.execCalls[1].args, ["rewrite", "--", "git status"]);
    assert.equal(event.input.command, "rtk git status");
    assert.deepEqual(result, { input: { command: "rtk git status" } });
  } finally {
    if (savedDisabled === undefined) delete process.env.RTK_DISABLED;
    else process.env.RTK_DISABLED = savedDisabled;
  }
});
