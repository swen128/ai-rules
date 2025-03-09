---
name: Bun:TDD
groups:
  - read
  - edit
  - browser
  - command
  - mcp
source: "project"
---

# TDD Mode

In TDD mode, based on the TDD philosophy, we proceed step by step with test addition, test modification, and refactoring.

If a file includes `@tdd` at the beginning, it's in test-first mode.

### Concept: Tests are Specifications

Tests are considered to represent specifications. Please infer specifications from the module's README.md and test list.

```
$ bun test <module> --coverage
```

### Test Implementation Order

Test code is implemented in the following order:

1. Write the expected result (assertion) first
2. Confirm the validity of the assertion with the user
3. Once confirmed, write the operation (Act) code
4. Finally, write the preparation (Arrange) code

This differs from the execution order (Arrange → Act → Assert). Starting implementation from the result clarifies the purpose before proceeding with implementation.

Implementation example:

```ts
// @script @tdd
import { err, ok, Result } from "neverthrow";

// Type definition
export interface User {
  id: string;
  name: string;
}

export type ApiError =
  | { type: "unauthorized"; message: string }
  | { type: "network"; message: string };

// Interface definition
declare function getUser(
  token: string,
  id: string,
): Promise<Result<User, ApiError>>;

import { expect, test } from "bun:test";

test("When given a valid token, retrieving user information should succeed", async () => {
  // 1. First write the expected result
  const expectedUser: User = {
    id: "1",
    name: "Test User",
  };

  // 2. Confirm the validity of the result with the user

  // 3. Next write the operation
  const result = await getUser("valid-token", "1");

  // 4. Finally write the preparation (not needed in this example)

  // Assertion
  expect(result.isOk()).toBe(true);
  result.map((user) => {
    expect(user).toEqual(expectedUser);
  });
});

test("When given an invalid token, retrieving user information should fail", async () => {
  // 1. First write the expected result
  const expectedError: ApiError = {
    type: "unauthorized",
    message: "Invalid token",
  };

  // 2. Confirm the validity of the result with the user

  // 3. Next write the operation
  const result = await getUser("invalid-token", "1");

  // Assertion
  expect(result.isErr()).toBe(true);
  result.mapErr((error) => {
    expect(error).toEqual(expectedError);
  });
});
```

### Test and Assertion Naming Conventions

Test names are written in the following format:

```
"When {situation}, {operation} should {result}"
```

Examples:

- "When given a valid token, retrieving user information should succeed"
- "When given an invalid token, retrieving user information should fail"

### Detailed Development Procedure

1. Define type signatures
   ```ts
   declare function getUser(
     token: string,
     id: string,
   ): Promise<Result<User, ApiError>>;
   ```

   Add export for libraries

2. For each test case:

   a. Define the expected result
   ```ts
   const expectedUser: User = {
     id: "1",
     name: "Test User",
   };
   ```

   b. **Confirm the result with the user**
   - At this point, confirm if the expected result is appropriate
   - If specification review or additions are needed, modify here

   c. Implement operation code
   ```ts
   const result = await getUser("valid-token", "1");
   ```

   d. Implement necessary preparation code
   ```ts
   // Only if needed
   const mockApi = new MockApi();
   mockApi.setup();
   ```

TDD mode is compatible with other modes.

## TDD Example in Bun

This example demonstrates the Test-Driven Development (TDD) process in Bun.

### Directory Structure

```
tdd-example/
  index.ts   - Public interface (re-exports only)
  lib.ts     - Implementation (using imports from deps.ts)
  index.test.ts - Test code
```

### Actual TDD Procedure (Steps)

1. **Write tests**: Write test cases in `index.test.ts` that define the expected behavior of the code.
2. **Confirm test failure**: Verify that the tests fail because there's no implementation yet.
3. **Implement code**: Implement code in `lib.ts` that satisfies the test cases.
4. **Confirm test success**: Verify that the tests pass.

### Procedure for Adding Failing Tests

1. **Confirm tests pass**: Run `bun test --coverage` to verify that all tests pass.
2. **Add a failing test**: Add a new test case to `index.test.ts`. This test should fail because the implementation doesn't exist yet.
3. **Confirm test failure**: Run `bun test tdd-example` to verify that the added test fails.
4. **Run only the failing test**: Run `bun test tdd-example --filter "<test name>"` to run only the failing test. Replace `<test name>` with the name of the failing test.
5. **Make types pass**: Define the function in `lib.ts` and re-export it in `index.ts`. Implement it with `throw new Error("wip")`.
6. **Implement**: Write the implementation in `lib.ts` that makes the test pass.

### Refactor Phase

After the tests pass, suggest refactoring to the user.

- `bun run typecheck <target>`
- `bun run lint <target>`

#### Measuring and Checking Code Coverage

After tests pass, it's recommended to measure code coverage to verify that tests cover all parts of the code.

1. Collect coverage data:
   ```bash
   bun test --coverage <test file>
   ```

2. Generate and check coverage report:
   ```bash
   bun test --coverage
   ```

3. Check detailed report:
   ```bash
   bun test --coverage
   ```

If coverage is not 100%, consider adding test cases to improve coverage.

#### Using TSR for Dead Code Removal

After tests pass, it's also recommended to use TSR (TypeScript Remove) to detect dead code (unused code).

1. First detect dead code:
   ```bash
   bun run tsr 'index\\.ts$'
   ```

2. Check detection results:
   - Unused exports and files will be displayed
   - Note: Test files are detected as dead code because they're not referenced from entry points

3. Confirm with the user whether to delete:
   - "TSR detected the following dead code. Do you want to delete it?"
   - Only if the user agrees, run the following command:
     ```bash
     bun run tsr --write 'index\\.ts$'
     ```
   - To exclude test files:
     ```bash
     bun run tsr --write 'index\\.ts$' '.*\\.test\\.ts$'
     ```

Removing dead code keeps the codebase clean and makes future maintenance easier.

#### Using Git Workflow

In the TDD process, it's important to properly version control changes at each phase. The following Git workflow is recommended:

1. **Check commit status**:
   ```bash
   git status
   ```
   - Check the current state of changes before starting work or transitioning between steps

2. **Commit after test modification**:
   - After adding or modifying tests, ask the user if they want to commit
   - "I've modified the tests. Do you want to commit this?"
   - If the user agrees, consider a commit message and execute:
     ```bash
     git add <changed files>
     git commit -m "test: Add tests for XX functionality"
     ```

3. **Commit after implementation**:
   - After implementing to make tests pass, ask the user if they want to commit
   - "Implementation is complete. Do you want to commit this?"
   - If the user agrees:
     ```bash
     git add <changed files>
     git commit -m "feat: Implement XX functionality"
     ```

4. **Commit after refactoring**:
   - After refactoring, ask the user if they want to commit
   - "Refactoring is complete. Do you want to commit this?"
   - If the user agrees:
     ```bash
     git add <changed files>
     git commit -m "refactor: Refactor XX implementation"
     ```

5. **Creating commit messages**:
   - Analyze the change log and consider appropriate commit messages
   - Use prefixes to clarify intent:
     - `test:` - Adding/modifying tests
     - `feat:` - Implementing new features
     - `fix:` - Bug fixes
     - `refactor:` - Code refactoring
     - `docs:` - Documentation updates
     - `chore:` - Changes to build process or tools

By committing at each step, the TDD cycle is clearly recorded, making it easier to track changes later.

### TypeFirst Mode

When asked to think about types together, it's TypeFirst mode.

First write the type signatures of the implementation and test code. Only perform type checking, and if type checking passes, propose the type signatures to the user.

Once the type signatures are confirmed, write how they would be used as test code. When asked "What would the specification look like with these type signatures?", write test code.

After agreeing on the specification, proceed to implementation.