// Test utilities for common test setup and mocking

export const createMockCSVData = (count: number = 3) => {
  const data = [];
  for (let i = 1; i <= count; i++) {
    data.push({
      name: `Test User ${i}`,
      email: `user${i}@example.com`,
      company: `Company ${i}`
    });
  }
  return data;
};

export const createMockMailConfig = () => ({
  senderName: 'Test Sender',
  email: 'sender@example.com',
  password: 'testpassword'
});

export const createMockFiles = () => ({
  'message.txt': 'Hello {name}, welcome to {company}!',
  'subject.txt': 'Welcome {name}',
  'data.csv': 'name,email,company\nJohn Doe,john@example.com,ACME Corp\nJane Smith,jane@example.com,TechCorp',
  'mailconfig.json': JSON.stringify(createMockMailConfig())
});

export const mockFileSystem = (files: Record<string, string>) => {
  const fs = require('fs');
  
  fs.existsSync = jest.fn((path: string) => {
    return Object.keys(files).some(file => path.includes(file));
  });
  
  fs.readFileSync = jest.fn((path: string) => {
    const fileName = Object.keys(files).find(file => path.includes(file));
    return fileName ? files[fileName] : '';
  });
  
  fs.createReadStream = jest.fn((path: string) => {
    const { Readable } = require('stream');
    const stream = new Readable();
    const fileName = Object.keys(files).find(file => path.includes(file));
    const content = fileName ? files[fileName] : '';
    
    stream.push(content);
    stream.push(null);
    
    return stream;
  });
};

export const expectThrowError = (mockThrowError: jest.MockedFunction<any>, message: string) => {
  expect(mockThrowError).toHaveBeenCalledWith(message);
};

export const createMockReadlineInterface = () => ({
  question: jest.fn(),
  close: jest.fn()
});

export const createMockTransporter = () => ({
  sendMail: jest.fn(),
  close: jest.fn()
});

export const createMockMailer = () => ({
  mailer: jest.fn(),
  transporter: createMockTransporter(),
  count: 0
});
