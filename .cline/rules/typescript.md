## TypeScript

Here's a summary of general best practices for coding in TypeScript.

### Approach

- First consider types and function interfaces that process them
- Document file specifications as clearly as possible in code comments
- When implementations don't have internal state, prefer functions over class implementations
- To abstract side effects, use the adapter pattern for external dependencies and use in-memory adapters for testing

### Type Usage Guidelines

1. Use specific types
   - Avoid using any
   - Use unknown and then narrow down the type
   - Utilize Utility Types

2. Type alias naming
   - Use meaningful names
   - Clearly indicate the intent of the type
   ```ts
   // Good
   type UserId = string;
   type UserData = {
     id: UserId;
     createdAt: Date;
   };

   // Bad
   type Data = any;
   ```

### Error Handling

1. Using Result type
   ```ts
   import { err, ok, Result } from "neverthrow";

   type ApiError =
     | { type: "network"; message: string }
     | { type: "notFound"; message: string }
     | { type: "unauthorized"; message: string };

   async function fetchUser(id: string): Promise<Result<User, ApiError>> {
     try {
       const response = await fetch(`/api/users/${id}`);
       if (!response.ok) {
         switch (response.status) {
           case 404:
             return err({ type: "notFound", message: "User not found" });
           case 401:
             return err({ type: "unauthorized", message: "Unauthorized" });
           default:
             return err({
               type: "network",
               message: `HTTP error: ${response.status}`,
             });
         }
       }
       return ok(await response.json());
     } catch (error) {
       return err({
         type: "network",
         message: error instanceof Error ? error.message : "Unknown error",
       });
     }
   }
   ```

2. Error type definition
   - Enumerate specific cases
   - Include error messages
   - Utilize type exhaustiveness checking

### Implementation Patterns

1. Function-based (when stateless)
   ```ts
   // Interface
   interface Logger {
     log(message: string): void;
   }

   // Implementation
   function createLogger(): Logger {
     return {
       log(message: string): void {
         console.log(`[${new Date().toISOString()}] ${message}`);
       },
     };
   }
   ```

2. Class-based (when stateful)
   ```ts
   interface Cache<T> {
     get(key: string): T | undefined;
     set(key: string, value: T): void;
   }

   class TimeBasedCache<T> implements Cache<T> {
     private items = new Map<string, { value: T; expireAt: number }>();

     constructor(private ttlMs: number) {}

     get(key: string): T | undefined {
       const item = this.items.get(key);
       if (!item || Date.now() > item.expireAt) {
         return undefined;
       }
       return item.value;
     }

     set(key: string, value: T): void {
       this.items.set(key, {
         value,
         expireAt: Date.now() + this.ttlMs,
       });
     }
   }
   ```

3. Adapter pattern (abstracting external dependencies)
   ```ts
   // Abstraction
   type Fetcher = <T>(path: string) => Promise<Result<T, ApiError>>;

   // Implementation
   function createFetcher(headers: Record<string, string>): Fetcher {
     return async <T>(path: string) => {
       try {
         const response = await fetch(path, { headers });
         if (!response.ok) {
           return err({
             type: "network",
             message: `HTTP error: ${response.status}`,
           });
         }
         return ok(await response.json());
       } catch (error) {
         return err({
           type: "network",
           message: error instanceof Error ? error.message : "Unknown error",
         });
       }
     };
   }

   // Usage
   class ApiClient {
     constructor(
       private readonly getData: Fetcher,
       private readonly baseUrl: string,
     ) {}

     async getUser(id: string): Promise<Result<User, ApiError>> {
       return await this.getData(`${this.baseUrl}/users/${id}`);
     }
   }
   ```

### Implementation Selection Criteria

1. When to choose functions
   - Simple operations only
   - No internal state needed
   - Few dependencies
   - Easy to test

2. When to choose classes
   - Internal state management needed
   - Need to maintain configuration or resources
   - State shared between methods
   - Lifecycle management needed

3. When to choose Adapters
   - Abstracting external dependencies
   - Need for mocking during testing
   - Want to hide implementation details
   - Need to ensure replaceability

### General Rules

1. Dependency injection
   - Inject external dependencies via constructor
   - Make replaceable with mocks during testing
   - Avoid global state

2. Interface design
   - Define minimum necessary methods
   - Don't include implementation details
   - Avoid platform-specific types

3. Testability
   - Keep mock implementations concise
   - Include edge case tests
   - Properly separate test helpers

4. Code splitting
   - Follow the single responsibility principle
   - Modularize at appropriate granularity
   - Avoid circular references
