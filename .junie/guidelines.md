# Cookify Development Guidelines

This document provides essential information for developers working on the Cookify project.

## Build/Configuration Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development Server
Run the development server with Turbopack for faster builds:
```bash
npm run dev
```
The application will be available at [http://localhost:3000](http://localhost:3000).

### Production Build
Build the application for production:
```bash
npm run build
```

Start the production server:
```bash
npm run start
```

### Environment Variables
Create a `.env.local` file in the root directory with the following variables:
```
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# External APIs (if used)
EDAMAM_APP_ID=your_edamam_app_id
EDAMAM_APP_KEY=your_edamam_app_key
```

## Testing Information

### Testing Setup
The project uses Jest and React Testing Library for testing. The configuration is in:
- `jest.config.js` - Main Jest configuration
- `jest.setup.js` - Setup file for Jest

Before running tests, make sure to install the required testing dependencies:
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

Note: The jest.config.js file references a package called 'next-jest', but this package doesn't seem to be available in the npm registry. You may need to check with the project maintainers for the correct package name or a custom implementation.

### Running Tests
Run all tests:
```bash
npm test
```

Run tests in watch mode (for development):
```bash
npm run test:watch
```

### Writing Tests

#### Component Tests
Create test files in a `__tests__` directory adjacent to the component being tested. For example:

```typescript
// components/__tests__/ComponentName.test.tsx
import { render, screen } from '@testing-library/react';
import ComponentName from '../ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    // Render the component
    render(React.createElement(ComponentName));
    // Check if the expected text is in the document
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

#### API Route Tests
There are two approaches for testing API routes:

##### Option 1: Using the `next-test-api-route-handler` package
```typescript
// app/api/__tests__/route-name.test.ts
import { testApiHandler } from 'next-test-api-route-handler';
import { GET, POST } from '../route-name/route';

describe('API Route: /api/route-name', () => {
  it('handles GET requests', async () => {
    await testApiHandler({
      handler: GET,
      test: async ({ fetch }) => {
        const res = await fetch();
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json).toEqual(expect.objectContaining({
          // expected response
        }));
      },
    });
  });
});
```

##### Option 2: Directly calling the handler functions
```typescript
// app/api/__tests__/route.test.ts
import { NextRequest } from 'next/server';
import { GET, POST } from '../route';

// Mock dependencies
jest.mock('@/lib/dbConnect', () => jest.fn());
jest.mock('@/models/Recipe', () => ({
  find: jest.fn(),
  create: jest.fn(),
}));

describe('Recipes API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET returns recipes successfully', async () => {
    // Mock the Recipe.find method
    const mockRecipes = [{ _id: '1', title: 'Recipe 1' }];
    require('@/models/Recipe').find.mockResolvedValue(mockRecipes);

    // Create a mock request
    const request = new NextRequest('http://localhost:3000/api/recipes');

    // Call the handler directly
    const response = await GET(request);
    const data = await response.json();

    // Verify the response
    expect(response.status).toBe(200);
    expect(data).toEqual(mockRecipes);
  });
});
```

#### Mocking External Services
For external services like MongoDB or API calls, use Jest mocks:

```typescript
// Mock MongoDB
jest.mock('@/lib/mongodb', () => ({
  connectToDatabase: jest.fn().mockResolvedValue({
    db: {
      collection: jest.fn().mockReturnValue({
        findOne: jest.fn().mockResolvedValue({ /* mock data */ }),
        // other collection methods
      }),
    },
  }),
}));

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ /* mock response */ }),
  })
) as jest.Mock;
```

#### Utility Function Tests
For utility functions, create test files in a `__tests__` directory adjacent to the utility file. Here's an example of testing string utility functions:

```typescript
// lib/__tests__/stringUtils.test.ts
import { capitalizeFirstLetter, truncateString } from '../stringUtils';

describe('String Utilities', () => {
  describe('capitalizeFirstLetter', () => {
    it('should capitalize the first letter of a string', () => {
      expect(capitalizeFirstLetter('hello')).toBe('Hello');
      expect(capitalizeFirstLetter('world')).toBe('World');
    });

    it('should return an empty string when given an empty string', () => {
      expect(capitalizeFirstLetter('')).toBe('');
    });

    it('should handle strings that are already capitalized', () => {
      expect(capitalizeFirstLetter('Hello')).toBe('Hello');
    });
  });

  describe('truncateString', () => {
    it('should truncate a string if it exceeds the maximum length', () => {
      expect(truncateString('Hello world', 5)).toBe('Hello...');
    });

    it('should not truncate a string if it is shorter than the maximum length', () => {
      expect(truncateString('Hello', 10)).toBe('Hello');
    });
  });
});
```

## Additional Development Information

### Project Structure
- `app/` - Next.js App Router pages and API routes
- `components/` - React components
- `lib/` - Utility functions and shared code
- `models/` - MongoDB models
- `public/` - Static assets
- `styles/` - Global styles
- `types/` - TypeScript type definitions

### Styling
The project uses Tailwind CSS with the HeroUI theme. Custom colors and extensions are defined in `tailwind.config.js`.

### State Management
For client-side state management, use React's built-in hooks (useState, useContext) for simple state or consider SWR/React Query for data fetching and caching.

### Authentication
Authentication is handled by NextAuth.js with MongoDB adapter. See the NextAuth configuration in `app/api/auth/[...nextauth]/route.ts`.

### API Integration
For nutritional data, the application integrates with external APIs like Edamam or OpenFoodFacts. API calls should be centralized in the `lib/` directory.

### Code Style
- Use TypeScript for type safety
- Follow ESLint rules for code quality
- Use functional components with hooks
- Prefer named exports over default exports for better refactoring
- Keep components small and focused on a single responsibility

### Performance Considerations
- Use Next.js Image component for optimized images
- Implement proper data fetching strategies (SSR, ISR, CSR) based on the use case
- Use React.memo for expensive components that re-render often
- Implement pagination for large data sets
