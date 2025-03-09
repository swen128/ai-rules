## Git Workflow

This document explains best practices for creating commits and pull requests.

### Creating Commits

Follow these steps when creating commits:

1. Check changes
   ```bash
   # Check untracked files and changes
   git status

   # Check detailed changes
   git diff

   # Check commit message style
   git log
   ```

2. Analyze changes
   - Identify files that have been changed or added
   - Understand the nature of the changes (new feature, bug fix, refactoring, etc.)
   - Evaluate impact on the project
   - Check for sensitive information

3. Create commit message
   - Focus on "why"
   - Use clear and concise language
   - Accurately reflect the purpose of the change
   - Avoid generic expressions

4. Execute commit
   ```bash
   # Stage only related files
   git add <files>

   # Create commit message (using HEREDOC)
   git commit -m "$(cat <<'EOF'
   feat: Introduce Result type for user authentication

   - Make error handling more type-safe
   - Force explicit handling of error cases
   - Improve tests

   🤖 Generated with ${K4}
   Co-Authored-By: Claude noreply@anthropic.com
   EOF
   )"
   ```

### Creating Pull Requests

Follow these steps when creating pull requests:

1. Check branch status
   ```bash
   # Check uncommitted changes
   git status

   # Check changes
   git diff

   # Check differences from main
   git diff main...HEAD

   # Check commit history
   git log
   ```

2. Analyze changes
   - Review all commits since branching from main
   - Understand the nature and purpose of changes
   - Evaluate impact on the project
   - Check for sensitive information

3. Create pull request
   ```bash
   # Create pull request (using HEREDOC)
   gh pr create --title "feat: Improve error handling with Result type" --body "$(cat <<'EOF'
   ## Overview

   Introduced Result type to make error handling more type-safe.

   ## Changes

   - Introduced Result type using neverthrow
   - Explicitly defined error cases
   - Added test cases

   ## Review Points

   - Is the Result type used appropriately?
   - Are error cases comprehensive?
   - Are tests sufficient?
   EOF
   )"
   ```

### Important Notes

1. Commit-related
   - Use `git commit -am` when possible
   - Don't include unrelated files
   - Don't create empty commits
   - Don't change git settings

2. Pull request-related
   - Create a new branch when needed
   - Commit changes appropriately
   - Use the `-u` flag when pushing to remote
   - Analyze all changes

3. Operations to avoid
   - Using interactive git commands (with -i flag)
   - Pushing directly to remote repository
   - Changing git settings

### Commit Message Examples

```bash
# Adding new features
feat: Introduce Result type for error handling

# Improving existing features
update: Improve cache performance

# Bug fixes
fix: Fix expired authentication token handling

# Refactoring
refactor: Abstract external dependencies using Adapter pattern

# Adding tests
test: Add tests for Result type error cases

# Updating documentation
docs: Add error handling best practices
```

### Pull Request Example

```markdown
## Overview

Introduced Result type to make TypeScript error handling more type-safe.

## Changes

- Introduced neverthrow library
- Used Result type in API client
- Defined error case types
- Added test cases

## Technical Details

- Replaced existing exception handling with Result type
- Standardized error types
- Improved mock implementations

## Review Points

- Is the Result type used appropriately?
- Are error cases comprehensive?
- Are tests sufficient?
