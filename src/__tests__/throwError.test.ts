import throwError from '../throwError';

describe('throwError', () => {
  let mockConsoleError: jest.SpyInstance;
  let mockProcessExit: jest.SpyInstance;

  beforeEach(() => {
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
    mockProcessExit = jest.spyOn(process, 'exit').mockImplementation();
  });

  afterEach(() => {
    mockConsoleError.mockRestore();
    mockProcessExit.mockRestore();
  });

  it('should print error message in red and exit with status 1', () => {
    const errorMessage = 'Test error message';
    
    throwError(errorMessage);
    
    expect(mockConsoleError).toHaveBeenCalledWith('\x1b[31m%s\x1b[0m', errorMessage);
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });

  it('should handle empty error message', () => {
    const errorMessage = '';
    
    throwError(errorMessage);
    
    expect(mockConsoleError).toHaveBeenCalledWith('\x1b[31m%s\x1b[0m', errorMessage);
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });
});
