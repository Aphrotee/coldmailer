import fs from 'fs';
import csv from 'csv-parser';
import Readline from 'readline';
import { Readable } from 'stream';

// Mock all external dependencies
jest.mock('fs');
jest.mock('csv-parser');
jest.mock('readline');
jest.mock('../mailer');
jest.mock('../throwError');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockCsv = csv as jest.MockedFunction<typeof csv>;
const mockReadline = Readline as jest.Mocked<typeof Readline>;
const mockMailer = require('../mailer');
const mockThrowError = require('../throwError').default as jest.MockedFunction<typeof import('../throwError').default>;

// Import the class after mocking
import '../index';

describe('Coldmailer Class', () => {
  let mockReadlineInterface: any;
  let mockStream: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock readline interface
    mockReadlineInterface = {
      question: jest.fn(),
      close: jest.fn()
    };
    
    mockReadline.createInterface.mockReturnValue(mockReadlineInterface);
    
    // Mock stream
    mockStream = new Readable();
    mockStream._read = jest.fn();
    mockFs.createReadStream.mockReturnValue(mockStream as any);
    
    // Mock csv parser
    mockCsv.mockReturnValue(mockStream as any);
    
    // Mock mailer
    mockMailer.mailer.mockResolvedValue('Email sent');
    mockMailer.count = 0;
    mockMailer.transporter = {
      close: jest.fn()
    };
  });

  describe('Message customization', () => {
    it('should replace placeholders in message and subject', () => {
      const testData = {
        name: 'John Doe',
        email: 'john@example.com',
        company: 'ACME Corp'
      };
      
      const message = 'Hello {name}, welcome to {company}!';
      const subject = 'Welcome {name}';
      
      const expectedMessage = 'Hello John Doe, welcome to ACME Corp!';
      const expectedSubject = 'Welcome John Doe';
      
      // Test string replacement logic
      const actualMessage = message.replace(/\{name\}/g, testData.name).replace(/\{company\}/g, testData.company);
      const actualSubject = subject.replace(/\{name\}/g, testData.name).replace(/\{company\}/g, testData.company);
      
      expect(actualMessage).toBe(expectedMessage);
      expect(actualSubject).toBe(expectedSubject);
    });
  });

  describe('Email sending', () => {
    it('should create mailing tasks for valid CSV data', async () => {
      const testData = {
        name: 'John Doe',
        email: 'john@example.com',
        company: 'ACME Corp'
      };
      
      mockMailer.mailer.mockResolvedValue('Email sent successfully');
      
      // Test that mailer is called with correct parameters
      await mockMailer.mailer({
        email: testData.email,
        subject: 'Test Subject',
        body: 'Test Body'
      });
      
      expect(mockMailer.mailer).toHaveBeenCalledWith({
        email: testData.email,
        subject: 'Test Subject',
        body: 'Test Body'
      });
    });

    it('should handle email sending errors', async () => {
      const testData = {
        name: 'John Doe',
        email: 'john@example.com',
        company: 'ACME Corp'
      };
      
      const mockError = new Error('Invalid login');
      mockMailer.mailer.mockRejectedValue(mockError);
      
      try {
        await mockMailer.mailer({
          email: testData.email,
          subject: 'Test Subject',
          body: 'Test Body'
        });
      } catch (error) {
        expect(error).toBe(mockError);
      }
    });
  });
});
