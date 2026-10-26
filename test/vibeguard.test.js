const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync, spawnSync } = require("node:child_process");
const { parseDiff, scanAdded } = require("../src");
const { checkLine } = require("../src/rules");
const diff = fs.readFileSync(path.join(__dirname, "../examples/ai-change.diff"), "utf8");
const ids = (l, file = "src/a.ts") => checkLine(l, { file }).map((x) => x.rule);

test("parseDiff tracks new line numbers", () => {
  const f = parseDiff(diff);
  assert.deepEqual(f.map((x) => x.file), ["src/api/users.ts", "src/api/users.test.ts", "src/db.ts"]);
  assert.equal(f[0].added[0].line, 10); assert.equal(f[2].added[1].line, 5);
});
test("rules fire on AI leftovers", () => {
  assert.deepEqual(ids('console.log("x")'), ["console-log"]);
  assert.deepEqual(ids("// ... rest of the code"), ["ai-placeholder"]);
  assert.deepEqual(ids("  debugger;", "a.js"), ["debugger"]);
  assert.deepEqual(ids("it.only('x', () => {})", "a.test.js"), ["focused-test"]);
  assert.deepEqual(ids("<<<<<<< HEAD"), ["conflict-marker"]);
  assert.deepEqual(ids('const k = "ghp_' + "a".repeat(36) + '"'), ["secret"]);
  assert.deepEqual(ids("// FIXME later", "a.py"), ["todo"]);
});
test("no false positives on env usage / examples / tests", () => {
  assert.deepEqual(ids("const key = process.env.OPENAI_API_KEY"), []);
  assert.deepEqual(ids('API_KEY="sk-your-key-here-xxxxxxxx"', ".env.example"), []);
  assert.deepEqual(ids('console.log("ok")', "src/a.test.js"), []);
  assert.deepEqual(ids("const url = process.env.DATABASE_URL;"), []);
});
test("scanAdded + ignore comment", () => {
  const r = scanAdded(parseDiff(diff));
  assert.equal(r.filter((x) => x.level === "error").length, 3);
  assert.ok(r.some((x) => x.rule === "fake-data"));
  assert.equal(scanAdded([{ file: "a.js", added: [{ line: 1, text: "console.log(1) // vibeguard-ignore" }] }]).length, 0);
});
test("cli exit codes", () => {
  const bin = path.join(__dirname, "../bin/vibeguard.js");
  const bad = spawnSync("node", [bin, "--stdin"], { input: diff, encoding: "utf8" });
  assert.equal(bad.status, 1); assert.match(bad.stdout, /3 errors/);
  const ok = spawnSync("node", [bin, "--stdin"], { input: "+++ b/a.js\n@@ -0,0 +1 @@\n+const a = 1;\n", encoding: "utf8" });
  assert.equal(ok.status, 0); assert.match(ok.stdout, /Clean/);
  const j = JSON.parse(spawnSync("node", [bin, "--stdin", "--json", "--only", "secret"], { input: diff, encoding: "utf8" }).stdout);
  assert.equal(j.findings.length, 1);
});
