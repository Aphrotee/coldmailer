import csv from 'csv-parser';
import fs from 'fs';
import mailer from './mailer.js';
import Readline from 'readline';

const results: Array<object> = []; 
const tasks: Array<Promise<void>> = [];
let subject: string = '';
let message: string = '';
const dataPath: string = './testdata0.csv'
const messagePath: string = './message.txt'
const subjectPath: string = './subject.txt';

const readline = Readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const p: Promise<Array<object>> = new Promise((resolve, reject) => {
  if (fs.existsSync(messagePath)) {
    fs.createReadStream(messagePath)
      .on('data', (data) => {
        message += data;
      })
      .on('end', () => {
        if (!message) {
          console.error('\x1b[31m%s\x1b[0m', "Error: You did not put a message to be sent in the message.txt file, what did you expect me to send the receipients?\nBreeze?\n\
Please write something in the message.txt, a guide can be found in the README.md at the root of this folder");
          process.exit(1);       
        } else {
          const fakeName = "Anderson";
          const fakeCompany = "Google";
          const exampleMessage = message.replace(/\{name\}/g, fakeName).replace(/\{company\}/g, fakeCompany);
          console.log(exampleMessage);
          console.log('\x1b[33m%s\x1b[0m', "\nAbove is an example of the message to be customised and sent to each recipient, do you wish to proceed?");
          readline.question("Type 'Y' to continue, and any other key to not: ", (arg) => {
            if (!(arg === 'Y' || arg === 'y')) {
              process.exit();
            }
            readline.close();
            if (fs.existsSync(subjectPath)) {
              subject = fs.readFileSync(subjectPath, 'utf-8').toString();
              if (!subject) {
                console.log('\x1b[31m%s\x1b[0m', "Error: Please give your email a subject in the subject.txt file.");
                process.exit(1);
              }
            } else {
              console.log('\x1b[31m%s\x1b[0m', "Error: subject.txt file not found!");
              process.exit(1);
            }
            // console.log("subject: ", subject);
            if (fs.existsSync(dataPath)) {
              fs.createReadStream(dataPath)
                .pipe(csv())
                .on('data', (data) => {
                  data['sentMail'] = false;
                  if (!("name" in data)) {
                    console.log('\x1b[31m%s\x1b[0m', "Error: I could not seem to find the 'name' field in the csv file, do something about it");
                    process.exit(1);
                  } else if (!("email" in data)) {
                    console.log('\x1b[31m%s\x1b[0m', "Error: I could not seem to find the 'email' field in the csv file, do something about it");
                    process.exit(1);
                  } else if (!("company" in data)) {
                    console.log('\x1b[31m%s\x1b[0m', "Error: I could not seem to find the 'company' field in the csv file, do something about it");
                    process.exit(1);
                  }
                  const P: Promise<void> = new Promise<void>((resolve, reject) => {
                  const sSubject: string = `Hello ${data['name']}, welcome to ${data['company']}`;
                  const body: string = `<h1>Hello ${data['name']}, welcome to ${data['company']}.</h1>\nI'm just testing this out, so don't mind me.`;
                  const Body: string = message.replace(/\{name\}/g, data['name']).replace(/\{company\}/g, data['company']);//.replace(/\r\n/g, "<br>");
                  const Subject = subject.replace(/\{name\}/g, data['name']).replace(/\{company\}/g, data['company']);//.replace(/\r\n/g, "<br>");
                  console.log(Subject);
                  mailer(data['email'], Subject, `${Body}`)
                    .then(() => {
                      data['sentMail'] = true;
                      results.push(data);
                      resolve();
                    })
                    .catch(err => {
                      data['sentMail'] = false;
                      results.push(data);
                      reject(err);
                    });
                  });
                  tasks.push(P);
                })
                .on('end', () => {
                  if (tasks.length > 0) {
                    console.log('\x1b[33m%s\x1b[0m', 'sending emails...');
                    Promise.all(tasks);
                    resolve(results);
                  } else {
                    console.log('\x1b[31m%s\x1b[0m', "Error: There is no data in the csv file you provided, so it isn't useful, please supply a non-empty file");
                    process.exit(1);
                  }
                });
            } else {
              reject("csv file not found!");
            }
          });
        }
      })  
  } else {
    console.log('\x1b[31m%s\x1b[0m', "Error: message.txt file not found!");
    process.exit(1);
  }
});

p
.then(results => {
  console.log('\x1b[32m%s\x1b[0m', 'emails sent!\nReport:\n', results);
})
.catch(err => {
  console.log('\x1b[31m%s\x1b[0m', `Error: ${err}`);
  process.exit(1);
});