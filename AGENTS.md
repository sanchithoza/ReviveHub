# Agent Instructions: Coding Standards & Rules

This document defines the strict development standards that the AI agent must follow for this project.

## 1. Naming Conventions
*   **Rule:** Every variable, function, class, and component name must be entirely self-explanatory.
*   **Requirement:** Use descriptive, full-word names that convey intent and context without needing comments.
*   **Never:** Use single-letter variables (e.g., `i`, `x`, `e`), abstract abbreviations, or vague names.

### Examples:
*   ❌ `const t = 10;`
*   ✅ `const retryTimeoutInSeconds = 10;`
*   ❌ `function authUser(u, p)`
*   ✅ `function authenticateUser(username, password)`
*   ❌ `<UserDataBtn />`
*   ✅ `<FetchUserProfileButton />`

## 2. Operator Restrictions
*   **Rule:** Do not use shorthand operators that reduce code clarity.
*   **Requirement:** Write explicit expressions to ensure readability for all developers.
*   **Never:** Use the ternary operator (`condition ? a : b`) for complex logic or nesting.
*   **Never:** Use short-circuit evaluation (`&&` or `||`) for conditional rendering or control flow assignment. Always use explicit `if/else` statements.
*   **Never:** Use unary increment/decrement operators (`++`, `--`). Use explicit assignment (`+= 1`) instead.

### Examples:
*   ❌ `const status = isAdmin ? 'Active' : isGuest ? 'Limited' : 'None';`
*   ✅ Use an explicit `if/else` block or a `switch` statement instead.
*   ❌ `isLoggedIn && showDashboard();`
*   ✅ `if (isLoggedIn) { showDashboard(); }`
*   ❌ `counter++;`
*   ✅ `counter += 1;`

## 3. General Behavior
*   **Rule:** Review all generated code against Section 1 and Section 2 before presenting the final output.
*   **Rule:** Refuse or refactor any user prompt that asks to violate these readability rules.
