import fs from 'fs';
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

const jsonPath: string = './mailconfig.json'
let name: string = "";
let email: string = "";
let password: string = "";



if (fs.existsSync(jsonPath)) {
  try {
    const jsonString: string = fs.readFileSync(jsonPath, 'utf-8');
    const jsonData = JSON.parse(jsonString);
    if (!("name" in jsonData) || !jsonData['name']) {
      console.error("\x1b[31m%s\x1b[0m", "Error: Please enter your name in the mailconfig.json file");
      process.exit(1);
    } else if (!("email" in jsonData) || !jsonData['email']) {
      console.error("\x1b[31m%s\x1b[0m", "Error: Please enter your email in the mailconfig.json file. How do you want this tool to work without it? it's not magic you know...");
      process.exit(1);
    } else if (!("password" in jsonData) || !jsonData['password']) {
      console.error("\x1b[31m%s\x1b[0m", "Error: Please enter your third party password in the mailconfig.json file and NOT your email account login password");
      process.exit(1);
    }
    name = jsonData['name'];
    email = jsonData['email'];
    password = jsonData['password'];
  } catch (err: any) {
    console.error("\x1b[31m%s\x1b[0m", `Error: ${err.toString()}`);
  }
} else {
  console.error("\x1b[31m%s\x1b[0m", "Error: mailconfig.json file not found!");
  process.exit(1);
}

const transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo> = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: email ?email: 'web.chattmessaging@gmail.com',
    pass: password? password: 'iplptuaoprqkyjkr'
  }
});

const mailer = async (email: string, subject: string, body: string) => {
  const mailOptions = {
    from: 'Chatt Instant Messaging',
    to: email,
    subject: subject,
    text: body
  };

  new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("\x1b[31m%s\x1b[0m", `Error: ${error.toString(), error}`);;
      } else {
        resolve(info.response);
      }
    });
  })
    .then((response) => {
      console.log('Email sent to ' + email);
    })
}
  
  export default mailer;