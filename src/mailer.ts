import fs from 'fs';
import nodemailer from 'nodemailer';
import throwError from './throwError.js';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

const jsonPath: string = './mailconfig.json'
let credentials: { Name: string; Email: string; Password: string; } = { 'Name': '', 'Email': '', 'Password': '' };


function extractCredentials(jsonData: object & Record<"senderName", string> & Record<"email", string> & Record<"password", string>): { Name: string; Email: string; Password: string; } {

  /* check if the required fields are present and filled then extracts credentials otherwise throws respective error */
  if (!("senderName" in jsonData) || !jsonData['senderName']) {
    throwError("Error: sender name misssing. Enter your name in the mailconfig.json file.");
  } else if (!("email" in jsonData) || !jsonData['email']) {
    throwError("Error: sender email missing. Enter your email in the mailconfig.json file.");
  } else if (!("password" in jsonData) || !jsonData['password']) {
    throwError("Error: password not found. Enter your special app password in the mailconfig.json file\
 and NOT your google account login password, refer to the README.md for a guide on how to generate yours.");
  }
  const Name: string = jsonData['senderName'].trim();
  const Email: string = jsonData['email'].trim();
  const Password: string = jsonData['password'].trim();

  return { Name, Email, Password };

}

(function parseJSON() : void {
  /* check if mailconfig json file exists */
  if (fs.existsSync(jsonPath)) {

    /* read the mailconfig json file */
    try {
      const jsonString: string = fs.readFileSync(jsonPath, 'utf-8');
      const jsonData = JSON.parse(jsonString);

      /* attempts to extract credentials */
      credentials = extractCredentials(jsonData);

    } catch (err: any) {
      throwError(`Error: ${err.toString()}`);
    }
  } else {
    throwError("Error: mailconfig.json file not found!");
  }
})();

/* create and configure transporter object */
const transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo> = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: credentials['Email'],
    pass: credentials['Password']
  }
});

export default function mailer({ email, subject, body }: { email: string; subject: string; body: string; }): Promise<string> {

  /* create mail options */
  const mailOptions = {
    from: `${credentials['Name']} <${credentials['Email']}>`,
    to: email,
    subject: subject,
    text: body
  };

  /* send mail */
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error: Error | null, info: object & Record<"response", string>): void => {
      if (error) {
        reject(error);
      } else {
        resolve(info.response);
      }
    });
  });
}