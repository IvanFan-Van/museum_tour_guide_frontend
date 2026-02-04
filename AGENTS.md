# AGENTS.md - Agentic Coding Guidelines

This document provides guidelines for AI coding agents working in this React/TypeScript frontend codebase.

## Project Overview

A museum tour guide frontend application built with:
- **Framework:** React 19 + Vite 7
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 with CSS-first configuration
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Package Manager:** pnpm

## Build/Lint/Test Commands

```bash
# Install dependencies
pnpm install

# Development server
pnpm dev

# Production build (type-check + build)
pnpm build

# Lint all files
pnpm lint

# Preview production build
pnpm preview

# Type-check only (no emit)
pnpm exec tsc -b

# Type-check specific file
pnpm exec tsc --noEmit path/to/file.ts
```

### Testing

No test framework is currently configured. When adding tests:
- Consider Vitest (recommended for Vite projects)
- Run single test: `pnpm exec vitest run path/to/test.spec.ts`
- Run tests in watch mode: `pnpm exec vitest`

### Git Hooks

Pre-push hook runs lint and type-check (non-blocking):
```bash
pnpm lint || true
pnpm exec tsc -b || true
```

## Project Structure

```
src/
├── assets/          # SVG and static assets
├── components/      # React components (PascalCase.tsx)
│   └── ui/          # shadcn/ui components (DO NOT MODIFY DIRECTLY)
├── context/         # React context providers
├── hooks/           # Custom React hooks (use-*.ts)
├── lib/             # Utility functions
├── App.tsx          # Root component
├── main.tsx         # Entry point
└── index.css        # Global styles & Tailwind theme
```

## Code Style Guidelines

### Imports

Order imports as follows:
1. React and external packages
2. Internal imports using `@/` alias
3. Type imports use `import type { ... }` syntax

```typescript
// External packages first
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// Internal imports with @/ alias
import { ConversationContext } from "@/context/conversation_context";
import { useConversation } from "@/hooks/use-conversation";

// Type-only imports
import type { FileMetadata } from "@/hooks/use-conversation-manager";
```

SVG imports as React components:
```typescript
import UmagLogo from "@/assets/umag_logo.svg?react";
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `ChatInterface`, `WelcomeScreen` |
| Component files | PascalCase.tsx | `ChatInterface.tsx` |
| Hooks | camelCase with `use` prefix | `useChat`, `useConversation` |
| Hook files | kebab-case | `use-chat.ts`, `use-conversation.ts` |
| Context files | snake_case | `conversation_context.tsx` |
| Interfaces/Types | PascalCase | `Message`, `Conversation` |
| Variables/Functions | camelCase | `selectConversation`, `handleSubmit` |
| Unused variables | Underscore prefix | `_node`, `_unused` |

### TypeScript

- Strict mode is enabled
- Define explicit interfaces for complex types
- Function return types can be inferred for simple functions
- Use `React.RefObject<T | null>` for refs

```typescript
// Interface definitions
export interface Message {
    id: string;
    role: "user" | "ai";
    content: string;
}

// Hook with explicit return type
export default function useConversationManager(): ConversationManager {
    // implementation
}

// Props typed inline
export default function Header({ title }: { title: string }) {
    // implementation
}
```

### Component Patterns

- Use functional components with `export default function`
- Destructure props in function signature
- Use shadcn/ui components for UI primitives

```typescript
export default function Header() {
    const { selectConversation } = useConversation();
    
    return (
        <header className="flex items-center justify-between p-4">
            {/* JSX content */}
        </header>
    );
}
```

### Error Handling

- Use try-catch for async operations
- Log errors with `console.error`
- Show user feedback with toast notifications (sonner)
- Context hooks must throw if used outside provider

```typescript
// Context hook pattern
export function useConversation() {
    const context = useContext(ConversationContext);
    if (!context) {
        throw new Error(
            "useConversation must be used within a ConversationProvider"
        );
    }
    return context;
}

// Async error handling
try {
    await navigator.clipboard.writeText(content);
    toast.success("Content copied to clipboard!");
} catch (err) {
    console.error("Failed to copy content", err);
    toast.error("Failed to copy content");
}
```

### Styling

- Use Tailwind CSS utility classes
- Use `cn()` utility from `@/lib/utils` for conditional classes
- CSS variables are defined in `index.css` for theming
- Support light/dark mode via CSS variables

```typescript
import { cn } from "@/lib/utils";

<div className={cn(
    "flex items-center gap-2",
    isActive && "bg-primary text-primary-foreground"
)} />
```

### State Management

- Use React Context for global state (see `ConversationContext`)
- Custom hooks encapsulate complex logic
- Keep component state local when possible

## Environment Variables

Vite environment variables (prefix with `VITE_`):
- `VITE_API_URL` - WebSocket API endpoint
- `VITE_STATIC_URL` - Static assets URL

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

## ESLint Rules

Key rules from `eslint.config.js`:
- Unused variables with underscore prefix are allowed: `^_`
- `src/components/ui/` is excluded from linting (shadcn/ui)
- React hooks rules enforced
- TypeScript strict checks enabled

## Important Notes

1. **DO NOT modify files in `src/components/ui/`** - These are shadcn/ui generated components
2. **Use `@/` path alias** - Configured in tsconfig and vite.config.ts
3. **Run `pnpm lint` before committing** - Catches common issues
4. **Type-check with `pnpm exec tsc -b`** - Ensures type safety
5. **Comments may be in English or Chinese** - Both are acceptable in this codebase
