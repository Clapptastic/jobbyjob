import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect method with testing-library methods
expect.extend(matchers);

// Cleanup after each test case
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Create window mock
const windowMock = {
  matchMedia: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
  ResizeObserver: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
  localStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  },
  location: {
    href: 'http://localhost:5173',
    origin: 'http://localhost:5173',
    pathname: '/',
    search: '',
    hash: '',
  },
  navigator: {
    userAgent: 'test-agent',
    onLine: true,
    clipboard: {
      writeText: vi.fn(),
    },
  },
  crypto: {
    randomUUID: vi.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
  },
  document: {
    createElement: vi.fn((tag) => ({
      setAttribute: vi.fn(),
      style: {},
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      getElementsByTagName: vi.fn(() => []),
      querySelector: vi.fn(),
      querySelectorAll: vi.fn(() => []),
      textContent: '',
      className: '',
      id: '',
      tagName: tag.toUpperCase(),
      children: [],
      parentNode: null,
      remove: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      getBoundingClientRect: vi.fn(() => ({
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        width: 0,
        height: 0,
      })),
    })),
    head: {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    },
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    },
    createTextNode: vi.fn(() => ({
      textContent: '',
    })),
  },
};

// Set up global mocks
vi.stubGlobal('window', windowMock);
vi.stubGlobal('document', windowMock.document);
vi.stubGlobal('navigator', windowMock.navigator);
vi.stubGlobal('localStorage', windowMock.localStorage);
vi.stubGlobal('crypto', windowMock.crypto);

// Mock File
class MockFile {
  name: string;
  type: string;
  size: number;
  content: ArrayBuffer;

  constructor(content: Array<any> | ArrayBuffer, name: string, options: { type: string }) {
    this.name = name;
    this.type = options.type;
    this.content = content instanceof ArrayBuffer ? content : new ArrayBuffer(0);
    this.size = this.content.byteLength;
  }

  async arrayBuffer() {
    return this.content;
  }
}

vi.stubGlobal('File', MockFile);

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: { id: 'test-id' } }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: { id: 'test-id' } }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'test-id' } } }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-id' } }, error: null }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'test-url' } }),
        remove: vi.fn().mockResolvedValue({ error: null }),
      })),
      listBuckets: vi.fn().mockResolvedValue({ data: [{ name: 'resumes' }], error: null }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ data: [], error: null }),
      update: vi.fn().mockResolvedValue({ data: [], error: null }),
      upsert: vi.fn().mockResolvedValue({ data: [], error: null }),
      delete: vi.fn().mockResolvedValue({ error: null }),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
    })),
    rpc: vi.fn().mockResolvedValue({ data: {}, error: null }),
  })),
}));

// Mock goober
vi.mock('goober', () => ({
  styled: new Proxy(() => {}, {
    get: () => () => 'mock-styled-component',
    apply: () => () => 'mock-styled-component'
  }),
  keyframes: () => 'mock-keyframes',
  setup: vi.fn()
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn()
  },
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}));

// Mock window
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  length: 0,
  key: vi.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock crypto
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: vi.fn().mockImplementation(arr => {
      return arr.map(() => Math.floor(Math.random() * 256));
    })
  }
});