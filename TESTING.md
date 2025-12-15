# Testing Documentation

This document describes the testing infrastructure for LiveChat CaCaBox, including how to run tests, write new tests, and understand the test pipeline.

## Testing Stack

- **Test Framework**: [Vitest](https://vitest.dev/) - Fast unit test framework with TypeScript support
- **Coverage**: @vitest/coverage-v8 - Code coverage reporting
- **API Testing**: Supertest - HTTP assertion library
- **Database**: SQLite (separate test database)

## Quick Start

### Running Tests

```bash
# Run all tests once
pnpm test

# Run tests in watch mode (auto-rerun on changes)
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage

# Run tests with UI
pnpm test:ui
```

### Test Structure

```
tests/
├── setup.ts                      # Global test setup and configuration
├── admin/
│   └── adminRoutes.test.ts      # Admin interface database tests
└── services/
    └── media-scanner.test.ts    # Media scanner service tests
```

## Test Organization

### Unit Tests

Tests are organized by feature and located in the `tests/` directory:

- **Admin Tests** (`tests/admin/`): Database models, user management, media operations
- **Service Tests** (`tests/services/`): Media scanning, thumbnail generation

### Test Setup

The `tests/setup.ts` file configures the test environment:

- Sets up environment variables
- Creates test database
- Runs migrations before tests
- Mocks global logger
- Cleans up after tests complete

## Writing Tests

### Basic Test Structure

```typescript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  it('should do something', () => {
    const result = someFunction();
    expect(result).toBe(expectedValue);
  });
});
```

### Database Tests

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

describe('Database Operations', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create a record', async () => {
    const record = await prisma.model.create({
      data: { /* ... */ }
    });
    expect(record).toBeDefined();
    
    // Clean up
    await prisma.model.delete({ where: { id: record.id } });
  });
});
```

### Async Tests

```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

## Test Coverage

### Viewing Coverage

After running `pnpm test:coverage`, coverage reports are generated in the `coverage/` directory:

- **Text**: Console output
- **HTML**: Open `coverage/index.html` in browser
- **JSON**: Machine-readable format

### Coverage Goals

- **Statements**: Aim for > 80%
- **Branches**: Aim for > 75%
- **Functions**: Aim for > 80%
- **Lines**: Aim for > 80%

### Excluded from Coverage

The following are excluded from coverage reporting:
- `node_modules/`
- `dist/`
- Type definition files (`*.d.ts`)
- Configuration files
- Test files themselves

## CI/CD Test Pipeline

The GitHub Actions test pipeline runs automatically on:
- Every push to any branch
- Every pull request

### Pipeline Stages

1. **Lint** - ESLint code quality checks
2. **Type Check** - TypeScript compilation verification
3. **Tests** - Full test suite execution
4. **Build Check** - Verify server can start
5. **Security Audit** - Dependency vulnerability scanning

### Workflow File

See `.github/workflows/test.yml` for the complete pipeline configuration.

### Local Pipeline Simulation

Run all checks locally before pushing:

```bash
# Lint
pnpm lint

# Type check
npx tsc --noEmit

# Tests
pnpm test

# Coverage
pnpm test:coverage
```

## Existing Tests

### Admin Interface Tests

**File**: `tests/admin/adminRoutes.test.ts`

Tests the database models and operations for the admin interface:

- ✅ User model creation and validation
- ✅ Username uniqueness constraint
- ✅ MediaFolder creation and linking
- ✅ MediaItem creation with metadata
- ✅ Cascade deletion behavior
- ✅ Database model availability

### Media Scanner Tests

**File**: `tests/services/media-scanner.test.ts`

Tests the media scanning and thumbnail generation:

- ✅ Folder scanning without errors
- ✅ Empty folder handling
- ✅ Non-existent folder error handling
- ✅ Video thumbnail placeholder generation

## Adding New Tests

### 1. Create Test File

Create a new test file in the appropriate directory:

```bash
# For feature tests
tests/feature-name/feature.test.ts

# For service tests
tests/services/service-name.test.ts
```

### 2. Write Tests

Follow the existing patterns in `tests/admin/adminRoutes.test.ts` and `tests/services/media-scanner.test.ts`.

### 3. Run Tests

```bash
pnpm test
```

### 4. Verify Coverage

```bash
pnpm test:coverage
```

## Troubleshooting

### Tests Failing with Database Errors

**Problem**: `The table 'main.User' does not exist`

**Solution**: Ensure migrations are running in setup. Check `tests/setup.ts` and verify `pnpm migration:up` is executed.

### Logger Not Defined

**Problem**: `ReferenceError: logger is not defined`

**Solution**: The global logger mock is set up in `tests/setup.ts`. Ensure the setup file is being loaded by Vitest.

### Tests Timeout

**Problem**: Tests hang indefinitely

**Solution**: Check for:
- Unresolved promises
- Missing `await` keywords
- Database connections not closed
- Event listeners not cleaned up

### Prisma Client Issues

**Problem**: Prisma client generation errors

**Solution**: Run `pnpm generate` before running tests:

```bash
pnpm generate && pnpm test
```

## Best Practices

### 1. Test Isolation

- Each test should be independent
- Clean up created data after tests
- Don't rely on test execution order

### 2. Descriptive Names

```typescript
// ❌ Bad
it('test 1', () => { /* ... */ });

// ✅ Good
it('should create a user with valid username', () => { /* ... */ });
```

### 3. Arrange-Act-Assert

```typescript
it('should calculate total', () => {
  // Arrange
  const items = [1, 2, 3];
  
  // Act
  const total = sum(items);
  
  // Assert
  expect(total).toBe(6);
});
```

### 4. Clean Up Resources

```typescript
afterAll(async () => {
  await prisma.$disconnect();
  await server.close();
  // Clean up any test files
});
```

### 5. Use Descriptive Expectations

```typescript
// ❌ Less clear
expect(result).toBeTruthy();

// ✅ More clear
expect(result).toBe(true);
expect(user.isActive).toBe(true);
```

## Continuous Integration

The test pipeline runs on every commit and pull request. Status badges show:

- ✅ All tests passing
- ❌ Tests failing
- ⚠️ Tests skipped

### Required Checks

Pull requests must pass:
1. Linting
2. Type checking
3. All tests
4. Build verification

## Future Enhancements

Planned testing improvements:

- [ ] E2E tests with Playwright for admin interface
- [ ] Integration tests for Socket.IO events
- [ ] Performance benchmarks
- [ ] Load testing for media streaming
- [ ] Visual regression tests
- [ ] API contract tests

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## Support

For test-related issues:
1. Check test output for error messages
2. Review this documentation
3. Check existing tests for examples
4. Consult Vitest documentation
5. Open an issue on GitHub

---

**Last Updated**: 2024-12-15
**Test Framework Version**: Vitest 4.0.15
