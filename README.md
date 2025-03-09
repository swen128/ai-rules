# Custom instructions for AI coding agents

It manages configuration files for defining coding rules and modes in TypeScript projects, aiming to improve the quality and efficiency of AI-generated code.

The main outputs are `.clinerules` and `.roomodes`.

## Project Overview

### Key Objectives

1. Define clear rules and modes for AI coding agents (like CLINE/Roo)
2. Establish best practices for TypeScript projects
3. Provide mechanisms for type-safe code generation and validation
4. Apply Test-Driven Development (TDD) workflow to AI coding


### Generated Files

Running the `bun run build` script generates the following files:

1. `.clinerules` - A file combining markdown files in the `rules` directory
2. `.roomodes` - A JSON file generated from markdown files in the `roomodes` directory

### Usage

1. Add or edit markdown files defining coding rules in the `.cline/rules` directory.
2. Add or edit markdown files defining implementation modes in the `.cline/roomodes` directory.
3. Run the `bun run build` script to generate the `.clinerules` and `.roomodes` files.

```bash
bun run build
```

4. The generated `.clinerules` and `.roomodes` files are read by AI coding assistants (like CLINE/Roo) to apply project rules and modes.

### Mode Switching

The modes defined in the project are:

- `bun-script` (Bun:ScriptMode) - Script mode
- `bun-module` (Bun:Module) - Module mode
- `bun-tdd` (Bun:TestFirstMode) - Test-first mode

To switch modes, instruct the AI coding assistant as follows:

```
Switch to bun-script mode.
```

Alternatively, you can specify the mode by including specific markers at the beginning of a file:

- Script mode: `@script`
- Test-first mode: `@tdd`

Example:

```ts
// @script @tdd
// This file is implemented in both script mode and test-first mode
```

## Development Environment Setup

### Required Tools

1. **Install Bun**

2. **Editor Configuration**
   - VSCode + TypeScript extensions
   - Configuration example:
     ```json
     {
       "typescript.tsdk": "node_modules/typescript/lib",
       "editor.formatOnSave": true,
       "editor.defaultFormatter": "esbenp.prettier-vscode"
     }
     ```

3. **Project Setup**
   ```bash
   # Clone repository
   git clone <repository-url>
   cd <repository-directory>
   
   # Install dependencies
   bun install
   
   # Generate rules and modes
   bun run build
   ```

### Development Workflow

1. **Creating a New Script**
   ```bash
   # Development in script mode
   touch scripts/new-script.ts
   # Add `@script` at the beginning of the file
   ```

2. **Running Tests**
   ```bash
   # Test a single file
   bun test scripts/new-script.ts
   
   # Run all tests
   bun test
   
   # Measure coverage
   bun test --coverage
   ```

3. **Linting and Formatting**
   ```bash
   # Lint
   bun run lint
   
   # Format
   bun run format
   ```

4. **Dependency Validation**
   ```bash
   bun run check:deps
   ```

## License

MIT
