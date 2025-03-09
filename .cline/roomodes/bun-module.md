---
name: Bun:Module
groups:
  - read
  - edit
  - browser
  - command
  - mcp
source: "project"
---

## Module

Describing Bun modules

Module mode consists of multiple files under a directory.

Example:

```
modules/xxx/
  index.ts   - Exports for external use (re-exports only)
  deps.ts    - Imports from other modules' index.ts and re-exports features used within the module
  lib.ts     - Implementation (using imports from deps.ts)
  types.ts   - Type definitions
  lib.test.ts
  test/*.test.ts - Integration tests describing specifications for index.ts
modules/minimum/
  index.ts   - Exports for external use (re-exports only)
  index.test.ts
  lib.ts     - Implementation (using imports from deps.ts)
```

`lib.ts` is where the initial implementation is placed, but when the code volume increases, it should be split with DDD in mind.

To test a module, run `bun test modules/<name>/*.test.ts`.

### How to Read a Module

Before directly reading the source code, check the module in the following order:

- read-file `README.md` to understand the overview
- Check the API to understand the specifications
- Run `bun test modules/<name>` to understand the specifications from test cases

When referencing external modules from a module, prioritize checking the API documentation. Reading the implementation should be the last resort.

### When Tests Fail

Follow these steps:

For feature additions:

1. For feature additions, first check if all tests pass with `bun test modules/<name>`
2. After modification, test the target script or module

For fixes:

1. Run `bun test modules/<name>/**.test.ts` to test the module
2. Check the failing module's tests and refer to the implementation

- Run tests one by one: `bun test modules/<name>/foo.test.ts`

3. Consider step by step why it's failing (don't make blind fixes!)
4. Modify the implementation. If necessary, insert print debugging to check the execution process
5. Check the module test execution results

- If fixed, remove print debugging
- If not fixed, return to step 3

5. Check overall tests outside the module

If tests fail, don't proceed to the next module until the failing tests are fixed.

### Module File Roles and Context Boundaries

A module's context is completely defined by two files: index.ts and deps.ts:

- index.ts: Module's public interface
  - Exports implementations to the outside
  - Other modules are prohibited from directly importing from anywhere else
  - Contains only re-exports, no implementations
  - Just by looking at this file, you can understand what functionality the module provides

- deps.ts: Module dependency definition
  - Imports from other modules' index.ts
  - Re-exports features used within the module
  - Centralizes external dependencies here
  - Just by looking at this file, you can understand the module's dependencies

Other files:

- types.ts: Consolidates type definitions within the module
- lib.ts: Responsible for implementation
  - When code volume is small (less than 150 lines), implementation under lib.ts is acceptable
  - When volume is large, split into multiple files
  - Within implementation, use imports from deps.ts
  - Not directly referenced from outside the module
- *.test.ts: Test files
  - Place in the same directory as implementation files
  - Create test files that correspond 1:1 with implementation files

This structure ensures:

- Module dependencies are transparent
- The impact range of code changes is predictable
- Low coupling between modules is maintained
- Refactoring is easier

In module mode, unlike script mode, direct references to npm packages are recommended. When referencing a module, add the dependency to package.json with `bun add packageName`.

```ts
// OK
import { z } from "zod";

// Not OK
import { z } from "zod@3.21.4";