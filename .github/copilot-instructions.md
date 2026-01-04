<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Copilot Instructions for Techo Lanka CCTV Management System

## Project Overview
This is a React TypeScript application for managing a CCTV business operations, built with Vite, Firebase, and Tailwind CSS. The application includes authentication, session management, and complete business management modules.

## Code Style and Conventions

### React Components
- Use functional components with TypeScript
- Prefer React hooks over class components
- Use React.FC type for component definitions
- Export components as named exports when possible
- Use proper TypeScript interfaces for props

### State Management
- Use Zustand for global state management
- Keep local state with useState for component-specific data
- Use custom hooks for reusable stateful logic

### Styling
- Use Tailwind CSS utility classes
- Follow the design system defined in tailwind.config.js
- Use custom CSS classes defined in index.css for common patterns
- Prefer responsive design with mobile-first approach

### File Structure
- Place components in appropriate directories (auth/, layout/, ui/)
- Keep related files together (types with services, etc.)
- Use index.ts files for clean imports

### Firebase Integration
- Use Firebase v9+ modular SDK
- Keep all Firebase configuration in services/firebase.ts
- Use proper error handling for Firebase operations
- Follow security best practices for Firestore rules

### Security Considerations
- Always validate user permissions before operations
- Use protected routes for sensitive pages
- Implement proper session timeout handling
- Sanitize user inputs and validate on both client and server

### Session Management
- Implement automatic session timeout after 30 minutes of inactivity
- Show warning dialogs before session expiry
- Update last activity on user interactions
- Clear sensitive data on logout

### Business Logic
- Follow invoice numbering format: INV-YYYY-XXXX
- Implement proper stock management with real-time updates
- Use immutable patterns for invoice data after creation
- Track all user activities for audit purposes

### Error Handling
- Use react-hot-toast for user notifications
- Implement proper error boundaries
- Log errors appropriately without exposing sensitive data
- Provide meaningful error messages to users

### Forms and Validation
- Use React Hook Form for form handling
- Implement Yup schemas for validation
- Show clear validation messages
- Disable forms during submission to prevent duplicate actions

### Accessibility
- Use semantic HTML elements
- Provide proper ARIA labels
- Ensure keyboard navigation works properly
- Maintain good color contrast ratios

## Coding Guidelines

1. **Type Safety**: Always use TypeScript types, avoid `any` type
2. **Performance**: Use React.memo for expensive components, implement proper loading states
3. **Testing**: Write unit tests for utility functions and integration tests for components
4. **Documentation**: Add JSDoc comments for complex functions and components
5. **Code Splitting**: Implement lazy loading for large components and pages

## Common Patterns

### API Service Pattern
```typescript
export class SomeService {
  static async getData(): Promise<ApiResponse<DataType>> {
    try {
      // Implementation
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Error message' };
    }
  }
}
```

### Component Props Pattern
```typescript
interface ComponentProps {
  // Required props first
  required: string;
  // Optional props with defaults
  optional?: boolean;
  // Event handlers
  onAction?: (data: DataType) => void;
  // Children if needed
  children?: React.ReactNode;
}
```

### Store Pattern
```typescript
interface StoreState {
  data: DataType[];
  loading: boolean;
  error: string | null;
}

interface StoreActions {
  setData: (data: DataType[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}
```

Please follow these guidelines when generating code for this project to maintain consistency and quality.
