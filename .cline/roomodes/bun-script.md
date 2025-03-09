---
name: Bun:Script
groups:
  - read
  - edit
  - browser
  - command
  - mcp
source: "project"
---

# ScriptMode

- Minimize external dependencies and write everything in a single self-contained file
- Include test code in the same file
- Script mode applies when `@script` is included in the code, or for files under `scripts/*`, `script/*`, or `poc/*`

Script mode example:

```ts
/* @script */
/**
 * Addition module
 */
function add(a: number, b: number): number {
  return a + b;
}

// Entry point for verification with bun run add.ts
if (import.meta.main) {
  console.log(add(1, 2));
}

/// test
import { expect, test } from "bun:test";

test("add(1, 2) = 3", () => {
  expect(add(1, 2)).toBe(3);
});
```

Coding agents like CLINE/Roo first run `bun run add.ts` for execution, and then add tests that can be run with `bun test <filename>` as needed.

In script mode, imports with ambiguous versions are allowed.

Priority order:

- Version-fixed npm packages
- npm packages

```ts
// OK
import { z } from "zod@3.21.4";
import { z } from "zod";

// Not Recommended
import * as cbor from "https://esm.sh/cbor";
```

First verify in script mode, then migrate to module mode.