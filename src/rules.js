"use strict";
/* Each rule: id, level (error|warn), test(line, ctx) -> message|false */
const SECRET_PATTERNS = [
  ["AWS access key", /\b(AKIA|ASIA)[0-9A-Z]{16}\b/],
  ["GitHub token", /\bgh[pousr]_[A-Za-z0-9]{36,}\b|\bgithub_pat_[A-Za-z0-9_]{50,}\b/],
  ["OpenAI key", /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/],
  ["Anthropic key", /\bsk-ant-[A-Za-z0-9_-]{20,}\b/],
  ["Groq key", /\bgsk_[A-Za-z0-9]{20,}\b/],
  ["Stripe secret key", /\b(sk|rk)_live_[A-Za-z0-9]{16,}\b/],
  ["Slack token", /\bxox[abprs]-[A-Za-z0-9-]{10,}\b/],
  ["Google API key", /\bAIza[0-9A-Za-z_-]{35}\b/],
  ["Discord bot token", /\b[MN][A-Za-z\d]{23,25}\.[\w-]{6}\.[\w-]{27,38}\b/],
  ["Private key", /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/],
  ["Credentials in URL", /\b[a-z][a-z0-9+.-]*:\/\/[^\s:@/]+:[^\s@/]{3,}@[^\s/]+/i],
  ["Hardcoded secret", /\b(?:api[_-]?key|secret|token|passw(?:or)?d|auth)\w*\s*[:=]\s*["'][^"'\s]{12,}["']/i],
];
const isTest = (f) => /(^|\/)(__tests__|tests?|spec)\/|\.(test|spec)\.[jt]sx?$/.test(f);
const isCode = (f) => /\.(m?[jt]sx?|cjs|vue|svelte|py|go|rb|php|java|kt|rs|swift|cs)$/.test(f);
const isJs = (f) => /\.(m?[jt]sx?|cjs|vue|svelte)$/.test(f);
const RULES = [
  { id: "conflict-marker", level: "error", test: (l) => /^(<{7}|={7}|>{7})( |$)/.test(l) && "Merge conflict marker" },
  { id: "secret", level: "error", test: (l, { file }) => { if (/\.(example|sample|template)$|\.md$/.test(file)) return false; for (const [name, re] of SECRET_PATTERNS) if (re.test(l) && !/(x{6,}|your[_-]|<[^>]+>|example|placeholder|\$\{|process\.env|os\.environ)/i.test(l)) return `Possible ${name}`; return false; } },
  { id: "focused-test", level: "error", test: (l, { file }) => isTest(file) && /\b(it|test|describe|context)\.only\s*\(|\bf(it|describe)\s*\(/.test(l) && "Focused test (.only) will skip the rest of the suite" },
  { id: "debugger", level: "error", test: (l, { file }) => isJs(file) && /^\s*debugger;?\s*$/.test(l) && "debugger statement" },
  { id: "console-log", level: "warn", test: (l, { file }) => isJs(file) && !isTest(file) && !/\/(scripts?|bin|cli)\//.test(file) && /\bconsole\.(log|debug|dir|table)\s*\(/.test(l) && !/^\s*\/\//.test(l) && "console.log left in code" },
  { id: "print-debug", level: "warn", test: (l, { file }) => /\.py$/.test(file) && /^\s*(print\(|breakpoint\(\)|import pdb|pdb\.set_trace)/.test(l) && "Debug print/breakpoint in Python" },
  { id: "todo", level: "warn", test: (l, { file }) => isCode(file) && /(\/\/|#|\/\*|\*)\s*(TODO|FIXME|XXX|HACK)\b/.test(l) && `New ${/(TODO|FIXME|XXX|HACK)/.exec(l)[1]} comment` },
  { id: "ai-placeholder", level: "error", test: (l, { file }) => isCode(file) && /(\.\.\.\s*(rest of|existing|remaining|other) (the )?(code|implementation|logic|functions?)|\/\/\s*\.\.\.\s*$|implement(ation)? (goes )?here|your (code|logic) here|add (your|more) .* here|placeholder implementation)/i.test(l) && "AI placeholder — code was elided, not written" },
  { id: "lorem", level: "warn", test: (l) => /lorem ipsum|dolor sit amet/i.test(l) && "Lorem ipsum placeholder text" },
  { id: "fake-data", level: "warn", test: (l, { file }) => isCode(file) && !isTest(file) && /["'](john[ .]?doe|jane[ .]?doe|test@test\.com|foo@bar\.com|123-456-7890|example@example\.com)["']/i.test(l) && "Hardcoded fake/mock data" },
  { id: "ts-ignore", level: "warn", test: (l, { file }) => /\.tsx?$/.test(file) && /@ts-(ignore|nocheck)|as any\b|: any\b/.test(l) && "Type safety escape hatch (any / @ts-ignore)" },
  { id: "eslint-disable", level: "warn", test: (l) => /eslint-disable(?!-next-line \S)/.test(l) && "Blanket eslint-disable" },
  { id: "localhost", level: "warn", test: (l, { file }) => isCode(file) && !isTest(file) && /["'`]https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(l) && !/process\.env|\?\?|\|\|/.test(l) && "Hardcoded localhost URL" },
];
function checkLine(line, ctx, only) { const out = []; for (const r of RULES) { if (only && !only.includes(r.id)) continue; const m = r.test(line, ctx); if (m) out.push({ rule: r.id, level: r.level, message: m }); } return out; }
module.exports = { RULES, SECRET_PATTERNS, checkLine, isTest };
