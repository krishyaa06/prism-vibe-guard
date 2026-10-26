<!-- ═════════════ HEADER ═════════════ -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:07060f,50:FF5E7E,100:6C63FF&height=200&section=header&text=Prism%20Vibe%20Guard&fontSize=48&fontColor=ffffff&animation=fadeIn&fontAlignY=36&desc=Lint%20AI%20leftovers%20in%20your%20diff&descAlignY=58&descSize=16" width="100%" alt="Prism Vibe Guard" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=19&duration=2600&pause=800&color=FF5E7E&center=true&vCenter=true&width=680&lines=vibeguard+--staged;Leaked+key%3F+Blocked.;%2F%2F+...+rest+of+code%3F+Caught.;Pre-commit+hook+in+1+command" alt="Typing SVG" />
</p>

<p align="center">
  <a href="https://github.com/krishyaa06/prism-vibe-guard/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/krishyaa06/prism-vibe-guard/ci.yml?branch=main&style=for-the-badge&label=CI&logo=githubactions&logoColor=white" alt="CI" /></a>
  <img src="https://img.shields.io/badge/Node.js-%E2%89%A518.17-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/dependencies-0-FF5E7E?style=for-the-badge" alt="Zero dependencies" />
  <a href="LICENSE"><img src="https://img.shields.io/github/license/krishyaa06/prism-vibe-guard?style=for-the-badge&color=6C63FF" alt="License" /></a>
</p>

<p align="center">
  <img src="assets/screenshots/demo.png" width="90%" alt="Prism Vibe Guard screenshot" />
</p>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png" width="100%" alt="" />

## ⚡ Overview

**Prism Vibe Guard** (`vibeguard`) is a tiny safety net for vibe coding. AI assistants are fast, but they leave things behind: a pasted API key, `console.log` everywhere, `// ... rest of the implementation` where real code should be, a `describe.only` that silently skips your suite. `vibeguard` checks **only the lines you added** (staged, since a branch, or from stdin) so it never nags about old code, and exits non-zero on errors so it works as a pre-commit hook or CI step.

## ✨ Features

- Checks **only added lines** — staged (default), `--base main`, or `git diff | vibeguard --stdin`
- **Secret detection**: OpenAI, Anthropic, Groq, GitHub, AWS, Stripe, Slack, Google, Discord, private keys, creds in URLs
- **AI placeholder detection**: `// ... rest of the code`, `implement here`, `your logic here`
- `console.log`, `debugger`, Python `print`/`breakpoint`, `.only` tests, conflict markers, `as any`, lorem ipsum, fake data, hardcoded localhost
- `vibeguard install-hook` adds a git pre-commit hook; `vibeguard-ignore` comment silences a line
- `--strict`, `--only <rules>`, `--json`, `--all` (scan whole repo); exit code 1 on errors

## 🚀 Quick Start

```bash
# run without installing
npx github:krishyaa06/prism-vibe-guard --staged

# or install globally
npm install -g github:krishyaa06/prism-vibe-guard
vibeguard install-hook
```

Requires Node.js 18.17+. No dependencies.

## 🛠️ Usage

```text
vibeguard                    check staged changes (default)
vibeguard --base main        check everything since branching from main
vibeguard --all [dir]        scan every file, not just changes
git diff | vibeguard --stdin check a diff from stdin
vibeguard install-hook       add a git pre-commit hook

    --strict      treat warnings as errors
    --only <ids>  comma-separated rule ids (see --list)
    --json        machine-readable output
    --list        list all rules
```

### Rules

| Level | Rule | Catches |
|---|---|---|
| error | `secret` | API keys, tokens, private keys, creds in URLs |
| error | `ai-placeholder` | `// ... rest of the code`, `implement here` |
| error | `focused-test` | `it.only`, `describe.only`, `fit` |
| error | `conflict-marker` | `<<<<<<<`, `=======`, `>>>>>>>` |
| error | `debugger` | `debugger;` |
| warn | `console-log` | `console.log/debug/dir/table` outside tests & scripts |
| warn | `todo` | new TODO / FIXME / HACK / XXX |
| warn | `ts-ignore` | `@ts-ignore`, `as any`, `: any` |
| warn | `print-debug` | Python `print(`, `breakpoint()`, `pdb` |
| warn | `lorem` / `fake-data` / `localhost` / `eslint-disable` | placeholders that shouldn't ship |

### In CI (GitHub Actions)

```yaml
- uses: actions/checkout@v4
  with: { fetch-depth: 0 }
- run: npx --yes github:krishyaa06/prism-vibe-guard --base origin/${{ github.base_ref }}
```

## 📁 Project Structure

```text
prism-vibe-guard/
├── assets/
│   ├── logo.png
│   └── logo.svg
├── bin/
│   └── vibeguard.js   # CLI entry
├── examples/
│   └── ai-change.diff   # demo diff
├── src/
│   ├── index.js   # diff parser + scanner
│   ├── rules.js   # all detection rules
│   ├── ui.js   # colours, tables
│   └── walk.js   # gitignore-aware walker
├── test/
│   └── vibeguard.test.js
├── .gitignore
├── LICENSE
├── README.md
└── package.json
```

## 🧪 Tests

```bash
npm test
```

Tests use the built-in `node:test` runner, so there is nothing to install. CI runs them on Node 20 and 22.

## 🤝 Contributing

1. Fork the repo and create a branch: `git checkout -b feature/my-idea`
2. Make your change and add a test in `test/`
3. Run `npm test` and open a Pull Request

## 🔷 Part of Prism Protocol

Prism Vibe Guard is one of the open-source tools built by [Prism Protocol](https://dc.gg/prismprotocol), a tech community where young builders learn, ship and compete together.

## 👤 Author

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/krishyaa06"><img src="https://github.com/krishyaa06.png" width="90" style="border-radius:50%" alt="Soumya Bhandare" /><br><b>Soumya Bhandare</b></a><br>
      <sub>Founder @ Prism Protocol</sub>
    </td>
    <td>
      <a href="https://dc.gg/prismprotocol"><img src="https://img.shields.io/badge/Discord-Prism%20Protocol-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord" /></a><br>
      <a href="https://instagram.com/prism_protocol_"><img src="https://img.shields.io/badge/Instagram-@prism__protocol__-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram" /></a><br>
      <a href="https://x.com/krishyaa06"><img src="https://img.shields.io/badge/X-@krishyaa06-000000?style=for-the-badge&logo=x&logoColor=white" alt="X" /></a>
    </td>
  </tr>
</table>

## 📄 License

Released under the [MIT License](LICENSE).

<p align="center">
  <b>If you like this project, consider giving it a ⭐</b><br>
  <sub>"Build. Create. Compete." · Made with ⚡ by Prism Protocol</sub>
</p>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:6C63FF,50:FF5E7E,100:07060f&height=110&section=footer" width="100%" alt="" />
