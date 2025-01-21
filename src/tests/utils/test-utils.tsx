import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { vi } from 'vitest';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Custom renderer that includes providers
export function renderWithProviders(ui: React.ReactElement, { route = '/' } = {}) {
  window.history.pushState({}, 'Test page', route);

  return rtlRender(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {ui}
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

// Mock file factory
export function createMockFile(content: string, name = 'test.pdf', type = 'application/pdf'): File {
  const blob = new Blob([content], { type });
  return new File([blob], name, { type });
}

// Mock Supabase response factory
export function createMockSupabaseResponse<T>(data: T | null = null, error: any = null) {
  return { data, error };
}

// Test data generators
export function generateTestUser() {
  const timestamp = Date.now();
  return {
    id: `test-${timestamp}`,
    email: `test-${timestamp}@example.com`,
    password: 'Test123!@#',
    created_at: new Date().toISOString()
  };
}

export function generateTestResume() {
  return {
    basics: {
      name: 'Test User',
      email: 'test@example.com',
      phone: '123-456-7890',
      summary: 'Experienced software engineer'
    },
    skills: [
      { name: 'JavaScript', level: 'Advanced' },
      { name: 'React', level: 'Advanced' },
      { name: 'Node.js', level: 'Intermediate' }
    ],
    work: [
      {
        company: 'Test Corp',
        position: 'Software Engineer',
        startDate: '2020-01',
        endDate: '2023-12',
        highlights: ['Led development of key features']
      }
    ],
    education: [
      {
        institution: 'Test University',
        area: 'Computer Science',
        studyType: 'Bachelor',
        startDate: '2016-09',
        endDate: '2020-05'
      }
    ]
  };
}

// Common test cleanup
export function cleanupMocks() {
  vi.clearAllMocks();
  localStorage.clear();
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

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Error boundary for testing error cases
export class TestErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div data-testid="error-boundary">
          Error: {this.state.error?.message}
        </div>
      );
    }
    return this.props.children;
  }
}

export * from '@testing-library/react';