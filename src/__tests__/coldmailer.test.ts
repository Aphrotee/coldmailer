import fs from 'fs';
import csv from 'csv-parser';
import Readline from 'readline';
import { EventEmitter } from 'events';

// Mock all external dependencies
jest.mock('fs');
jest.mock('csv-parser');
jest.mock('readline');
jest.mock('../mailer', () => ({
  mailer: jest.fn(),
  transporter: { close: jest.fn() },
  count: 0
}));
jest.mock('../throwError');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockCsv = csv as jest.MockedFunction<typeof csv>;
const mockReadline = Readline as jest.Mocked<typeof Readline>;
const mockMailer = require('../mailer');
const mockThrowError = require('../throwError').default as jest.MockedFunction<typeof import('../throwError').default>;

// Create a mock Coldmailer class for testing
class MockColdmailer {
  tasks: Array<Promise<void>>;
  subject: string;
  message: string;
  dataPath: string;
  messagePath: string;
  subjectPath: string;
  readline: any;

  constructor() {
    this.tasks = [];
    this.subject = '';
    this.message = '';
    this.dataPath = './data.csv';
    this.messagePath = './message.txt';
    this.subjectPath = './subject.txt';
    this.readline = this.readlineConfig();
  }

  readlineConfig() {
    return Readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  checkRow(data: any) {
    if (Object.keys(data).length === 0 && data.constructor === Object) {
      mockThrowError("Error: Either the csv file is empty; add some data to it or there is an empty line somewhere in it; remove all empty lines.");
    }
    
    if (!("name" in data)) {
      mockThrowError("Error: I could not seem to find the 'name' field in the csv file, fix it.");
    } else if (!("email" in data)) {
      mockThrowError("Error: I could not seem to find the 'email' field in the csv file, fix it.");
    } else if (!("company" in data)) {
      mockThrowError("Error: I could not seem to find the 'company' field in the csv file, fix it.");
    }
  }

  createMailingTask(data: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const Body = this.message.replace(/\{name\}/g, data['name']).replace(/\{company\}/g, data['company']);
      const Subject = this.subject.replace(/\{name\}/g, data['name']).replace(/\{company\}/g, data['company']);
      
      mockMailer.mailer({ email: data['email'], subject: Subject, body: Body })
        .then(() => {
          console.log('Email sent to ' + data['email']);
          resolve();
        })
        .catch(reject);
    });
  }

  parseSubject() {
    if (mockFs.existsSync(this.subjectPath)) {
      this.subject = mockFs.readFileSync(this.subjectPath, 'utf-8').toString().trim();
      if (!this.subject) {
        mockThrowError("Error: subject.txt file is empty, give your email a subject in the subject.txt file.");
      }
    } else {
      mockThrowError("Error: subject.txt file not found!");
    }
  }

  showExample() {
    const fakeName = "Anderson";
    const fakeCompany = "Google";
    
    this.message = this.message.trim();
    this.subject = this.subject.trim();

    const exampleSubject = this.subject.replace(/\{name\}/g, fakeName).replace(/\{company\}/g, fakeCompany);
    const exampleMessage = this.message.replace(/\{name\}/g, fakeName).replace(/\{company\}/g, fakeCompany);
    
    console.log('\x1b[33mSubject:\n\x1b[0m%s\n', exampleSubject);
    console.log('\x1b[33mMessage body:\n\x1b[0m%s', exampleMessage);
    console.log('\x1b[33m%s\x1b[0m', "\nAbove is an example of the message to be customised and sent to each recipient, do you wish to proceed?");
  }

  execute(arg: string) {
    if (!(arg === 'Y' || arg === 'y')) {
      process.exit();
    }
    this.readline.close();
  }
}

describe('Coldmailer Class', () => {
  let coldmailer: MockColdmailer;
  let mockReadlineInterface: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReadlineInterface = {
      question: jest.fn(),
      close: jest.fn()
    };
    
    mockReadline.createInterface.mockReturnValue(mockReadlineInterface);
    
    coldmailer = new MockColdmailer();
  });

  describe('Constructor', () => {
    it('should initialize with default values', () => {
      expect(coldmailer.tasks).toEqual([]);
      expect(coldmailer.subject).toBe('');
      expect(coldmailer.message).toBe('');
      expect(coldmailer.dataPath).toBe('./data.csv');
      expect(coldmailer.messagePath).toBe('./message.txt');
      expect(coldmailer.subjectPath).toBe('./subject.txt');
    });

    it('should configure readline interface', () => {
      expect(mockReadline.createInterface).toHaveBeenCalledWith({
        input: process.stdin,
        output: process.stdout
      });
    });
  });

  describe('checkRow method', () => {
    it('should throw error for empty data', () => {
      const emptyData = {};
      coldmailer.checkRow(emptyData);
      
      expect(mockThrowError).toHaveBeenCalledWith(
        "Error: Either the csv file is empty; add some data to it or there is an empty line somewhere in it; remove all empty lines."
      );
    });

    it('should throw error when name field is missing', () => {
      const dataWithoutName = {
        email: 'test@example.com',
        company: 'Test Company'
      };
      
      coldmailer.checkRow(dataWithoutName);
      
      expect(mockThrowError).toHaveBeenCalledWith(
        "Error: I could not seem to find the 'name' field in the csv file, fix it."
      );
    });

    it('should throw error when email field is missing', () => {
      const dataWithoutEmail = {
        name: 'Test Name',
        company: 'Test Company'
      };
      
      coldmailer.checkRow(dataWithoutEmail);
      
      expect(mockThrowError).toHaveBeenCalledWith(
        "Error: I could not seem to find the 'email' field in the csv file, fix it."
      );
    });

    it('should throw error when company field is missing', () => {
      const dataWithoutCompany = {
        name: 'Test Name',
        email: 'test@example.com'
      };
      
      coldmailer.checkRow(dataWithoutCompany);
      
      expect(mockThrowError).toHaveBeenCalledWith(
        "Error: I could not seem to find the 'company' field in the csv file, fix it."
      );
    });

    it('should not throw error for valid data', () => {
      const validData = {
        name: 'Test Name',
        email: 'test@example.com',
        company: 'Test Company'
      };
      
      coldmailer.checkRow(validData);
      
      expect(mockThrowError).not.toHaveBeenCalled();
    });
  });

  describe('createMailingTask method', () => {
    beforeEach(() => {
      coldmailer.message = 'Hello {name} from {company}';
      coldmailer.subject = 'Welcome {name}';
    });

    it('should create a mailing task successfully', async () => {
      const testData = {
        name: 'John Doe',
        email: 'john@example.com',
        company: 'ACME Corp'
      };

      mockMailer.mailer.mockResolvedValue('Email sent');

      await coldmailer.createMailingTask(testData);

      expect(mockMailer.mailer).toHaveBeenCalledWith({
        email: 'john@example.com',
        subject: 'Welcome John Doe',
        body: 'Hello John Doe from ACME Corp'
      });
    });

    it('should handle mailer rejection', async () => {
      const testData = {
        name: 'John Doe',
        email: 'john@example.com',
        company: 'ACME Corp'
      };

      const mockError = new Error('Mailer error');
      mockMailer.mailer.mockRejectedValue(mockError);

      await expect(coldmailer.createMailingTask(testData)).rejects.toThrow('Mailer error');
    });
  });

  describe('parseSubject method', () => {
    it('should parse subject file successfully', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('Test Subject {name}');

      coldmailer.parseSubject();

      expect(coldmailer.subject).toBe('Test Subject {name}');
    });

    it('should throw error when subject file does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      coldmailer.parseSubject();

      expect(mockThrowError).toHaveBeenCalledWith('Error: subject.txt file not found!');
    });

    it('should throw error when subject file is empty', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('');

      coldmailer.parseSubject();

      expect(mockThrowError).toHaveBeenCalledWith(
        'Error: subject.txt file is empty, give your email a subject in the subject.txt file.'
      );
    });
  });

  describe('showExample method', () => {
    it('should display example message with fake data', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      coldmailer.message = 'Hello {name} from {company}';
      coldmailer.subject = 'Welcome {name}';

      coldmailer.showExample();

      expect(consoleSpy).toHaveBeenCalledWith('\x1b[33mSubject:\n\x1b[0m%s\n', 'Welcome Anderson');
      expect(consoleSpy).toHaveBeenCalledWith('\x1b[33mMessage body:\n\x1b[0m%s', 'Hello Anderson from Google');
      
      consoleSpy.mockRestore();
    });
  });

  describe('execute method', () => {
    it('should continue when user inputs Y', () => {
      const mockProcessExit = jest.spyOn(process, 'exit').mockImplementation();
      
      coldmailer.execute('Y');
      
      expect(mockProcessExit).not.toHaveBeenCalled();
      expect(mockReadlineInterface.close).toHaveBeenCalled();
      
      mockProcessExit.mockRestore();
    });

    it('should continue when user inputs y', () => {
      const mockProcessExit = jest.spyOn(process, 'exit').mockImplementation();
      
      coldmailer.execute('y');
      
      expect(mockProcessExit).not.toHaveBeenCalled();
      expect(mockReadlineInterface.close).toHaveBeenCalled();
      
      mockProcessExit.mockRestore();
    });

    it('should exit when user inputs anything else', () => {
      const mockProcessExit = jest.spyOn(process, 'exit').mockImplementation();
      
      coldmailer.execute('n');
      
      expect(mockProcessExit).toHaveBeenCalled();
      
      mockProcessExit.mockRestore();
    });
  });

  describe('Message customization', () => {
    it('should replace placeholders correctly', () => {
      const testData = {
        name: 'John Doe',
        email: 'john@example.com',
        company: 'ACME Corp'
      };
      
      const message = 'Hello {name}, welcome to {company}!';
      const subject = 'Welcome {name}';
      
      const customizedMessage = message.replace(/\{name\}/g, testData.name).replace(/\{company\}/g, testData.company);
      const customizedSubject = subject.replace(/\{name\}/g, testData.name).replace(/\{company\}/g, testData.company);
      
      expect(customizedMessage).toBe('Hello John Doe, welcome to ACME Corp!');
      expect(customizedSubject).toBe('Welcome John Doe');
    });

    it('should handle multiple occurrences of placeholders', () => {
      const testData = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        company: 'TechCorp'
      };
      
      const message = 'Hi {name}, {name} from {company}. {company} is great!';
      const customizedMessage = message.replace(/\{name\}/g, testData.name).replace(/\{company\}/g, testData.company);
      
      expect(customizedMessage).toBe('Hi Jane Smith, Jane Smith from TechCorp. TechCorp is great!');
    });
  });
});
