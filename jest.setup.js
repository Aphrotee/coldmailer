// Jest setup file
// This file is run before each test suite

// Mock console methods to avoid cluttering test output
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeEach(() => {
  // You can customize console behavior here if needed
  jest.clearAllMocks();
});

afterEach(() => {
  // Restore original console methods if they were mocked
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

// Global test timeout
jest.setTimeout(30000);
