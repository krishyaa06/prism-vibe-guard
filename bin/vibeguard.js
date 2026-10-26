#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { parseArgs } = require("node:util");
const { scanAdded, fromGit, fromFiles, parseDiff, RULES, HOOK } = require("../src");
const { c, header, plural } = require("../src/ui");
const pkg = require("../package.json");

const HELP = `${header("vibeguard", "catch what the AI left behind")}

${c.bold("Usage")}
  vibeguard [options]              check staged changes (default)
  vibeguard --base main            check everything since branching from main
  vibeguard --all [dir]            scan every file, not just changes
  git diff | vibeguard --stdin     check a diff from stdin
  vibeguard install-hook           add a git pre-commit hook

${c.bold("Options")}
      --strict           treat warnings as errors
      --only <ids>       comma-separated rule ids
      --json             machine-readable output
      --list             list all rules
  -v, --version / -h, --help

Silence a line with a ${c.cyan("vibeguard-ignore")} comment.`;

let a;
try { a = parseArgs({ allowPositionals: true, options: { base: { type: "string" }, all: { type: "boolean" }, stdin: { type: "boolean" }, staged: { type: "boolean" }, strict: { type: "boolean" }, only: { type: "string" }, json: { type: "boolean" }, list: { type: "boolean" }, version: { type: "boolean", short: "v" }, help: { type: "boolean", short: "h" } } }); }
catch (e) { console.error(c.red(`✖ ${e.message}`)); process.exit(2); }
const o = a.values, cmd = a.positionals[0];
if (o.help) { console.log(HELP); process.exit(0); }
if (o.version) { console.log(pkg.version); process.exit(0); }
if (o.list) { for (const r of RULES) console.log(`${r.level === "error" ? c.red("error") : c.yellow("warn ")}  ${r.id}`); process.exit(0); }
if (cmd === "install-hook") {
  const hooks = path.resolve(".git/hooks");
  if (!fs.existsSync(hooks)) { console.error(c.red("✖ Not a git repository (no .git/hooks)")); process.exit(2); }
  const f = path.join(hooks, "pre-commit");
  if (fs.existsSync(f) && !fs.readFileSync(f, "utf8").includes("vibeguard")) { console.error(c.yellow(`⚠ ${f} already exists — add this line to it:\n  npx --yes github:krishyaa06/prism-vibe-guard --staged`)); process.exit(1); }
  fs.writeFileSync(f, HOOK, { mode: 0o755 }); console.log(`${c.green("✔")} Installed pre-commit hook at ${c.bold(".git/hooks/pre-commit")}`); process.exit(0);
}

let files, label;
try {
  if (o.stdin) { files = parseDiff(fs.readFileSync(0, "utf8")); label = "stdin diff"; }
  else if (o.all) { const dir = path.resolve(cmd || "."); files = fromFiles(dir); label = `all files in ${path.basename(dir)}`; }
  else { files = fromGit(process.cwd(), { base: o.base }); label = o.base ? `changes since ${o.base}` : "staged changes"; }
} catch (e) { console.error(c.red(`✖ ${String(e.stderr || e.message).trim().split("\n")[0]}`)); process.exit(2); }

const findings = scanAdded(files, { only: o.only?.split(",").map((s) => s.trim()) });
const errors = findings.filter((f) => f.level === "error" || o.strict), warns = findings.length - errors.length;
if (o.json) { console.log(JSON.stringify({ findings, errors: errors.length, warnings: warns }, null, 2)); process.exit(errors.length ? 1 : 0); }

console.log(header("vibeguard", label));
const lines = files.reduce((n, f) => n + f.added.length, 0);
if (!findings.length) { console.log(`\n${c.green("✔")} Clean — ${plural(files.length, "file")}, ${plural(lines, "line")} checked`); process.exit(0); }
const byFile = {};
for (const f of findings) (byFile[f.file] ??= []).push(f);
for (const [file, list] of Object.entries(byFile)) {
  console.log(`\n${c.under(c.bold(file))}`);
  for (const f of list) console.log(`  ${c.dim(String(f.line).padStart(4))}  ${f.level === "error" || o.strict ? c.red("✖ error") : c.yellow("⚠ warn ")}  ${f.message} ${c.dim(`(${f.rule})`)}\n        ${c.gray(f.text)}`);
}
console.log(`\n${errors.length ? c.red(`✖ ${plural(errors.length, "error")}`) : c.green("✔ 0 errors")}, ${c.yellow(plural(warns, "warning"))} in ${plural(Object.keys(byFile).length, "file")}`);
process.exit(errors.length ? 1 : 0);
