# Cookify Development Guidelines

This document provides essential information for developers working on the Cookify project.

## Build/Configuration Instructions

### Prerequisites
- Node.js (v20+)
- npm (v8+)

### Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.local` to create your own environment file
   - Update the variables as needed for your development environment

### Development Server
Run the development server with Turbopack for faster builds:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Production Build
Create a production build:
```bash
npm run build
```

Start the production server:
```bash
npm run start
```

## Testing Information

### Testing Framework
The project uses Jest for testing with React Testing Library for component testing.

### Running Tests
- Run all tests:
  ```bash
  npm test
  ```
- Run tests in watch mode (recommended during development):
  ```bash
  npm run test:watch
  ```
- Run specific tests by pattern:
  ```bash
  npm test -- -t "pattern"
  ```

### Test Structure
Tests are organized in `__tests__` directories alongside the code they test:
- Component tests: `components/__tests__/`
- Utility tests: `lib/__tests__/`

### Writing Tests

#### Component Tests
For React components, use React Testing Library to test from a user's perspective:

```typescript
// components/__tests__/ComponentName.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import ComponentName from '../ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', () => {
    render(<ComponentName />);
    fireEvent.click(screen.getByRole('button', { name: 'Button Text' }));
    expect(screen.getByText('Result Text')).toBeInTheDocument();
  });
});
```

#### API Route Tests
For API routes, mock the request/response objects:

```typescript
// app/api/__tests__/route-name.test.ts
import { GET, POST } from '../route';

describe('API Route', () => {
  it('handles GET requests', async () => {
    const req = new Request('http://localhost:3000/api/route');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('success', true);
  });
});
```

#### Utility Tests
For utility functions, test various input scenarios:

```typescript
// lib/__tests__/utilName.test.ts
import { functionName } from '../utilName';

describe('Utility Function', () => {
  it('handles normal input', () => {
    expect(functionName('input')).toBe('expected output');
  });

  it('handles edge cases', () => {
    expect(functionName('')).toBe('');
    expect(functionName(null)).toBeNull();
  });
});
```

### Mocking
For external dependencies, use Jest's mocking capabilities:

```typescript
// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: 'mocked data' }),
  })
) as jest.Mock;

// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
```

## Code Style and Development Guidelines

### Project Structure
- `app/` - Next.js App Router pages and API routes
- `components/` - React components
- `lib/` - Utility functions and shared code
- `public/` - Static assets
- `styles/` - Global styles
- `types/` - TypeScript type definitions

### TypeScript
- Use TypeScript for all new code
- Define interfaces for component props
- Use proper type annotations for function parameters and return values
- Avoid using `any` type when possible

### Component Guidelines
- Use functional components with hooks
- Keep components focused on a single responsibility
- Use proper prop typing with TypeScript interfaces
- Follow the component organization pattern:
  - UI components in `components/ui/`
  - Feature components in directories by feature (e.g., `components/recipes/`)

### State Management
- Use React hooks (useState, useReducer) for local component state
- For more complex state, consider using React Context API

### Styling
- Use Tailwind CSS for styling
- Use the HeroUI component library for common UI elements
- Follow the utility-first approach of Tailwind

### API Routes
- Organize API routes in the `app/api/` directory
- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Validate input data
- Return appropriate status codes and consistent response formats

### Error Handling
- Use try/catch blocks for async operations
- Provide meaningful error messages
- Log errors appropriately

### Documentation
- Add JSDoc comments to functions and components
- Document complex logic with inline comments
- Keep README and other documentation up to date

### Git Workflow
- Create feature branches from main
- Use descriptive commit messages
- Submit pull requests for code review before merging