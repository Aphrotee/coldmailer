import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

const transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo> = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'web.chattmessaging@gmail.com',
    pass: 'iplptuaoprqkyjkr'
  }
});

const mailer = async (email: string, subject: string, body: string) => {
  const mailOptions = {
    from: 'Chatt Instant Messaging',
    to: email,
    subject: subject,
    html: body
  };

  new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
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