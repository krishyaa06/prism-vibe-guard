"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { checkLine, RULES } = require("./rules");
const { walk, isBinary } = require("./walk");

function parseDiff(diff) {
  const files = []; let cur = null, ln = 0;
  for (const raw of String(diff).split("\n")) {
    if (raw.startsWith("+++ ")) { const p = raw.slice(4).replace(/^b\//, ""); cur = p === "/dev/null" ? null : { file: p, added: [] }; if (cur) files.push(cur); continue; }
    if (raw.startsWith("--- ") || raw.startsWith("diff ") || raw.startsWith("index ")) continue;
    const h = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(raw); if (h) { ln = +h[1]; continue; }
    if (!cur) continue;
    if (raw.startsWith("+")) { cur.added.push({ line: ln, text: raw.slice(1) }); ln++; }
    else if (raw.startsWith(" ")) ln++;
  }
  return files;
}
function scanAdded(files, { only, ignore = [] } = {}) {
  const findings = [];
  for (const f of files) {
    if (ignore.some((g) => f.file.includes(g))) continue;
    for (const { line, text } of f.added) {
      if (/vibeguard-ignore/.test(text)) continue;
      for (const hit of checkLine(text, { file: f.file }, only)) findings.push({ file: f.file, line, text: text.trim().slice(0, 140), ...hit });
    }
  }
  return findings;
}
const git = (args, cwd) => execFileSync("git", args, { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] });
function fromGit(cwd, { base, staged = true } = {}) {
  const args = ["diff", "--no-color", "--unified=0", "--no-ext-diff"];
  if (base) args.push(`${base}...HEAD`); else if (staged) args.push("--cached");
  return parseDiff(git(args, cwd));
}
function fromFiles(root) {
  return walk(root).filter((f) => !/\.(png|jpe?g|gif|webp|ico|pdf|zip|woff2?|ttf|lock)$|package-lock\.json$/.test(f)).map((f) => {
    const buf = fs.readFileSync(path.join(root, f));
    if (isBinary(buf) || buf.length > 512 * 1024) return { file: f, added: [] };
    return { file: f, added: buf.toString("utf8").split("\n").map((text, i) => ({ line: i + 1, text })) };
  });
}
const HOOK = `#!/bin/sh\n# installed by vibeguard\nnpx --yes github:krishyaa06/prism-vibe-guard --staged || {\n  echo "\\nvibeguard blocked this commit. Fix the errors above or commit with --no-verify."; exit 1; }\n`;
module.exports = { parseDiff, scanAdded, fromGit, fromFiles, RULES, HOOK };
