import { vi } from 'vitest';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Custom renderer that includes providers
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <BrowserRouter>
        {children}
      </BrowserRouter>
    ),
    ...options,
  });
}

// Mock file factory
export function createMockFile(content: string, name = 'test.pdf', type = 'application/pdf'): File {
  return new File([content], name, { type });
}

// Mock Supabase response factory
export function createMockSupabaseResponse<T>(data: T | null = null, error: any = null) {
  return { data, error };
}

// Test data generators
export const generateTestUser = () => ({
  id: `test-${Date.now()}`,
  email: `test-${Date.now()}@example.com`,
  password: 'Test123!@#'
});

export const generateTestResume = () => ({
  skills: ['JavaScript', 'React', 'Node.js'],
  experience: [
    {
      title: 'Software Engineer',
      company: 'Test Corp',
      duration: '2020-2023'
    }
  ],
  education: [
    {
      degree: 'Computer Science',
      school: 'Test University',
      year: '2020'
    }
  ]
});

// Common test cleanup
export function cleanupMocks() {
  vi.clearAllMocks();
}

// Async utilities
export async function waitForMockCall(mock: ReturnType<typeof vi.fn>, timeout = 1000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (mock.mock.calls.length > 0) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  return false;
}

// Error boundary for testing error cases
export class TestErrorBoundary extends React.Component<{ children: React.ReactNode }> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <div data-testid="error-boundary">Error: {this.state.error?.message}</div>;
    }
    return this.props.children;
  }
} 