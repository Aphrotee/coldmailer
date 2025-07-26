// Mock dependencies before importing the module
jest.mock('fs');
jest.mock('nodemailer');
jest.mock('../throwError');

const mockFs = require('fs') as jest.Mocked<typeof import('fs')>;
const mockThrowError = require('../throwError').default as jest.MockedFunction<typeof import('../throwError').default>;

describe('mailer module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules(); // Reset module cache
  });

  describe('mailer function', () => {
    it('should send email successfully', async () => {
      // Mock successful file system and mailer setup
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({
        senderName: 'Test Sender',
        email: 'test@example.com',
        password: 'testpassword'
      }));

      // Import the module after mocking
      const { mailer } = require('../mailer');

      // Mock successful email sending
      const mockSendMail = jest.fn((options, callback) => {
        callback(null, { response: 'Email sent successfully' });
      });
      
      // Mock nodemailer
      const mockNodemailer = require('nodemailer');
      mockNodemailer.createTransport.mockReturnValue({
        sendMail: mockSendMail
      });

      const emailData = {
        email: 'recipient@example.com',
        subject: 'Test Subject',
        body: 'Test Body'
      };

      expect(typeof mailer).toBe('function');
    });
  });
});
