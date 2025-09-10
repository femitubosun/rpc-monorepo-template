# @template/db-utils

Database utilities package for Collabscape platform, providing type-safe pagination and query helpers for Prisma.

## Installation

```bash
pnpm add @template/db-utils
```

## Features

- **🔒 Type-Safe Pagination**: Full TypeScript integration with Prisma delegates
- **🎯 Smart Type Inference**: Automatic model and args type extraction from Prisma delegates
- **📊 Comprehensive Query Support**: Works with all Prisma findMany parameters (where, select, include, orderBy, etc.)
- **⚡ Zero Configuration**: Works with any Prisma model out of the box
- **🛡️ Runtime Safety**: Built-in validation with Zod schemas

## Core Functions

### `findManyWithPagination<TDelegate>`

The main pagination utility that provides type-safe, paginated queries for any Prisma model.

#### Type Signature

```typescript
function findManyWithPagination<TDelegate extends PrismaDelegate>(
  input: FindManyWithPaginationInput<TDelegate>
): Promise<PaginatedResult<ExtractModelType<TDelegate>>>
```

#### Input Structure

The `findManyArgs` parameter accepts **all standard Prisma findMany options**:

```typescript
{
  // 🎯 SELECTION & PROJECTION
  select?: ModelSelect | null          // Choose specific fields to return
  omit?: ModelOmit | null             // Exclude specific fields from result
  include?: ModelInclude | null        // Include related models (joins)

  // 🔍 FILTERING & QUERYING
  where?: ModelWhereInput             // Filter conditions (main query logic)

  // 📊 SORTING
  orderBy?: ModelOrderByInput | ModelOrderByInput[]

  // 🎲 DISTINCTNESS
  distinct?: ModelScalarFieldEnum | ModelScalarFieldEnum[]

  // Note: take/skip are handled by our pagination system
}
```

## Usage Examples

### Basic Pagination

```typescript
import { findManyWithPagination } from '@template/db-utils';
import { prisma } from '@template/db';

// Simple user pagination with automatic type inference
const result = await findManyWithPagination({
  modelDelegate: prisma.user,
  findManyArgs: {
    where: { active: true }
  },
  pagination: { page: 1, perPage: 10 }
});

// result.data is typed as User[]
// result.meta contains { total, totalPages, perPage, page }
```

### Advanced Filtering and Selection

```typescript
// Complex query with joins, filtering, and field selection
const assets = await findManyWithPagination({
  modelDelegate: prisma.asset,
  findManyArgs: {
    where: {
      uploadStatus: 'READY',
      variants: {
        some: {
          type: 'IMAGE'
        }
      }
    },
    select: {
      id: true,
      filename: true,
      uploadStatus: true,
      variants: {
        select: {
          id: true,
          type: true,
          url: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  },
  pagination: { page: 2, perPage: 20 }
});

// assets.data is typed as Array<{id: string, filename: string, ...}>
```

### Search with Pagination

```typescript
// Text search across multiple fields
const creators = await findManyWithPagination({
  modelDelegate: prisma.creator,
  findManyArgs: {
    where: {
      OR: [
        { displayName: { contains: searchTerm, mode: 'insensitive' } },
        { bio: { contains: searchTerm, mode: 'insensitive' } }
      ]
    },
    include: {
      user: {
        select: { email: true }
      },
      socialChannels: true
    }
  },
  pagination: { page: 1, perPage: 15 }
});
```

### Relationships and Aggregations

```typescript
// Complex relationship queries
const campaigns = await findManyWithPagination({
  modelDelegate: prisma.campaign,
  findManyArgs: {
    where: {
      status: 'ACTIVE',
      brand: {
        tier: 'PREMIUM'
      }
    },
    include: {
      brand: {
        select: { name: true, tier: true }
      },
      contentSlots: {
        where: { status: 'AVAILABLE' },
        include: {
          creator: {
            select: { displayName: true }
          }
        }
      }
    },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'desc' }
    ]
  },
  pagination: { page: 1, perPage: 5 }
});
```

## Schema Helpers

### `CreatePaginatedOutputSchema<T>`

Creates a Zod schema for paginated responses:

```typescript
import { CreatePaginatedOutputSchema } from '@template/db-utils';
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string()
});

const PaginatedUsersSchema = CreatePaginatedOutputSchema(UserSchema);

// Validates: { data: User[], meta: { total: number, totalPages: number, ... } }
```

### `CreateListingInputSchema`

Creates input validation schemas for listing endpoints:

```typescript
const UserListingSchema = CreateListingInputSchema({
  search: true,
  filters: z.object({
    role: z.enum(['ADMIN', 'USER']).optional(),
    active: z.boolean().optional()
  }),
  pagination: true
});

// Validates: { search?: string, filters?: {...}, pagination?: {...} }
```

## Type Safety Features

### 🎯 **Automatic Type Inference**

The function automatically infers types from the Prisma delegate you pass:

```typescript
// TypeScript knows this returns Asset[] without manual typing
const assets = await findManyWithPagination({
  modelDelegate: prisma.asset,  // TDelegate = AssetDelegate
  findManyArgs: { /* AssetFindManyArgs */ }
});

// Full IntelliSense for Asset-specific properties in where clauses
const filtered = await findManyWithPagination({
  modelDelegate: prisma.asset,
  findManyArgs: {
    where: {
      uploadStatus: 'READY',  // ✅ TypeScript validates this enum
      invalidField: 'value'   // ❌ TypeScript error - property doesn't exist
    }
  }
});
```

### 🛡️ **Compile-Time Safety**

```typescript
// ❌ This won't compile - mismatched delegate and args
await findManyWithPagination({
  modelDelegate: prisma.user,     // UserDelegate
  findManyArgs: {
    where: { uploadStatus: 'READY' }  // ❌ uploadStatus doesn't exist on User
  }
});

// ✅ This works perfectly
await findManyWithPagination({
  modelDelegate: prisma.user,     // UserDelegate
  findManyArgs: {
    where: { email: 'user@example.com' }  // ✅ email exists on User
  }
});
```

### 📋 **Return Type Extraction**

```typescript
// Extract the exact return type for further processing
type UserPaginationResult = Awaited<ReturnType<typeof findManyWithPagination<typeof prisma.user>>>;
// Type: PaginatedResult<User>

type AssetPaginationResult = Awaited<ReturnType<typeof findManyWithPagination<typeof prisma.asset>>>;
// Type: PaginatedResult<Asset>
```

## Response Format

All pagination functions return a consistent structure:

```typescript
interface PaginatedResult<T> {
  data: T[];                    // Array of model instances
  meta: {
    total: number;              // Total records matching query
    totalPages: number;         // Total pages available
    perPage: number;           // Records per page
    page: number;              // Current page number
  };
}
```

## Utility Functions

### `toPrismaSkipTake(pagination)`

Converts page-based pagination to Prisma's skip/take format:

```typescript
import { toPrismaSkipTake } from '@template/db-utils';

const { skip, take } = toPrismaSkipTake({ page: 3, perPage: 20 });
// { skip: 40, take: 20 }
```

## Best Practices

### 1. **Use Specific Selections for Performance**

```typescript
// ✅ Good - Only fetch needed fields
const users = await findManyWithPagination({
  modelDelegate: prisma.user,
  findManyArgs: {
    select: { id: true, email: true, name: true }
  }
});

// ❌ Avoid - Fetches all fields including large ones
const users = await findManyWithPagination({
  modelDelegate: prisma.user,
  findManyArgs: {} // Fetches everything
});
```

### 2. **Index Your Where Clauses**

```typescript
// Ensure database indexes exist for commonly filtered fields
const assets = await findManyWithPagination({
  modelDelegate: prisma.asset,
  findManyArgs: {
    where: {
      uploadStatus: 'READY',     // Index on uploadStatus
      createdAt: { gte: date }   // Index on createdAt
    }
  }
});
```

### 3. **Limit Deep Includes**

```typescript
// ✅ Good - Selective includes
include: {
  user: { select: { email: true } },
  posts: { take: 5, orderBy: { createdAt: 'desc' } }
}

// ❌ Avoid - Unlimited deep includes
include: {
  user: { include: { profile: { include: { ... } } } }
}
```

## Development

```bash
# Build the package
pnpm build

# Watch for changes
pnpm dev

# Type checking
pnpm check-types

# Linting
pnpm lint
```

## Contributing

When adding new database utilities:

1. **Maintain type safety** - Use proper TypeScript generics and constraints
2. **Add Zod validation** - Provide schema helpers for new utilities
3. **Include examples** - Add usage examples to this README
4. **Test thoroughly** - Ensure compatibility across different Prisma models

## Architecture Notes

The pagination utility leverages TypeScript's advanced type system to provide:

- **Delegate Type Extraction**: `Parameters<TDelegate['findMany']>[0]` extracts exact argument types
- **Model Type Inference**: `Awaited<ReturnType<TDelegate['findMany']>>[number]` extracts model types
- **Generic Constraints**: `TDelegate extends PrismaDelegate` ensures only valid delegates are accepted

This design provides the full power of Prisma's type system while adding convenient pagination functionality.
