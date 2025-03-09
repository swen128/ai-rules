# Coding Practices

## Principles

### Functional Programming (FP)

- Prioritize pure functions
- Use immutable data structures
- Isolate side effects
- Ensure type safety

### Domain-Driven Design (DDD)

- Distinguish between value objects and entities
- Ensure consistency with aggregates
- Abstract data access with repositories
- Be mindful of bounded contexts

### Test-Driven Development (TDD)

- Red-Green-Refactor cycle
- Treat tests as specifications
- Iterate in small units
- Continuous refactoring

## Implementation Patterns

### Type Definitions

```typescript
// Ensure type safety with branded types
type Branded<T, B> = T & { _brand: B };
type Money = Branded<number, "Money">;
type Email = Branded<string, "Email">;
```

### Value Objects

- Immutable
- Identity based on value
- Self-validating
- Contains domain operations

```typescript
// Creation functions with validation
function createMoney(amount: number): Result<Money, Error> {
  if (amount < 0) return err(new Error("Negative amounts not allowed"));
  return ok(amount as Money);
}
```

### Entities

- Identity based on ID
- Controlled updates
- Consistency rules

### Result Type

```typescript
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
```

- Explicitly indicate success/failure
- Use early return pattern
- Define error types

### Repositories

- Handle only domain models
- Hide persistence details
- Provide in-memory implementation for testing

### Adapter Pattern

- Abstract external dependencies
- Define interfaces on the caller side
- Easily replaceable for testing

## Implementation Procedure

1. **Type Design**
   - Define types first
   - Express domain language with types

2. **Implement Pure Functions First**
   - Start with functions that have no external dependencies
   - Write tests first

3. **Isolate Side Effects**
   - Push I/O operations to function boundaries
   - Wrap processes with side effects in Promises

4. **Implement Adapters**
   - Abstract access to external services and databases
   - Prepare mocks for testing

## Practices

- Start small and expand gradually
- Avoid excessive abstraction
- Prioritize types over code
- Adjust approach based on complexity

## Code Style

- Prefer functions (use classes only when necessary)
- Utilize immutable update patterns
- Flatten conditional branches with early returns
- Define error and use case enums

## Testing Strategy

- Prioritize unit tests for pure functions
- Test repositories with in-memory implementations
- Build testability into design
- Assert-first: work backward from expected results
