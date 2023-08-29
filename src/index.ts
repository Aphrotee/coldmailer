import csv from 'csv-parser';
import fs from 'fs';
import mailer from './mailer.js';
import Readline from 'readline';

const results: Array<object> = []; 
const tasks: Array<Promise<void>> = [];
let subject: string = '';
let message: string = '';
const dataPath: string = './data.csv'
const messagePath: string = './message.txt'
const subjectPath: string = './subject.txt';


const readline = Readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const p: Promise<Array<object>> = new Promise((resolve, reject) => {

  /* check if the message text file exists */
  if (fs.existsSync(messagePath)) {
    fs.createReadStream(messagePath)
      .on('data', (data) => {

        /* the message text is split into chunks and each chunk of data read is put together */
        message += data;
      })
      .on('end', () => {
        if (!message) {

          /* throw error when message.txt file is empty */
          console.error('\x1b[31m%s\x1b[0m', "Error: You did not put a message to be sent in the message.txt file\n\
Write something in the message.txt, a guide can be found in the README.md at the root of this folder");
          process.exit(1);       
        } else {

          /* show the user what theb message would look like when customised and sent */
          const fakeName = "Anderson";
          const fakeCompany = "Google";

          /* remove leading and trailing whitespace */
          message = message.trim();
          const exampleMessage = message.replace(/\{name\}/g, fakeName).replace(/\{company\}/g, fakeCompany);
          console.log(exampleMessage);
          console.log('\x1b[33m%s\x1b[0m', "\nAbove is an example of the message to be customised and sent to each recipient, do you wish to proceed?");
          readline.question("Type 'Y' to continue, and any other key to not: ", (arg) => {
            
            /* receive input from stdin on whether the user is satisfied with the way the messae looks and wants to proceed to sending it */
            if (!(arg === 'Y' || arg === 'y')) {
              process.exit();
            }
            readline.close();

            /* check if the subject text file exists */
            if (fs.existsSync(subjectPath)) {
              subject = fs.readFileSync(subjectPath, 'utf-8').toString().trim();
              if (!subject) {

                /* throw error when message.txt file is empty */
                console.error('\x1b[31m%s\x1b[0m', "Error: subject.txt file is empty, give your email a subject in the subject.txt file.");
                process.exit(1);
              }
            } else {

              /* throw error when message.txt file does not exist */
              console.error('\x1b[31m%s\x1b[0m', "Error: subject.txt file not found!");
              process.exit(1);
            }

            /* check if the recipients csv file exists */
            if (fs.existsSync(dataPath)) {
              fs.createReadStream(dataPath)
                .pipe(csv())
                .on('data', (data) => {

                  /* checks if the csv file is empty or contains empty lines */
                  if (Object.keys(data).length === 0 && data.constructor === Object) {
                    console.error('\x1b[31m%s\x1b[0m', "Error: Either the csv file is empty; add some data to it or there is an empty line somewhere in it; remove all empty lines");
                    process.exit(1);
                  }

                  /* check if the required fields are present otherwise throws respective error */
                  if (!("name" in data)) {
                    console.error('\x1b[31m%s\x1b[0m', "Error: I could not seem to find the 'name' field in the csv file, fix it");
                    process.exit(1);
                  } else if (!("email" in data)) {
                    console.error('\x1b[31m%s\x1b[0m', "Error: I could not seem to find the 'email' field in the csv file, fix it");
                    process.exit(1);
                  } else if (!("company" in data)) {
                    console.error('\x1b[31m%s\x1b[0m', "Error: I could not seem to find the 'company' field in the csv file, fix it");
                    process.exit(1);
                  }

                  /* a Promise is used to create a mail dispatch task for each recipient in the csv file */
                  const P: Promise<void> = new Promise<void>((resolve, reject) => {

                    /* create customized subject and email body for each recipient */
                    const Body: string = message.replace(/\{name\}/g, data['name']).replace(/\{company\}/g, data['company']);//.replace(/\r\n/g, "<br>");
                    const Subject: string = subject.replace(/\{name\}/g, data['name']).replace(/\{company\}/g, data['company']);//.replace(/\r\n/g, "<br>");
                    mailer({ email: data['email'], subject: Subject, body: Body })
                      .then(info => {
                        console.log('Email sent to ' + data['email']);
                        data['sentMail'] = true;
                        results.push(data);
                        resolve();
                      })
                      .catch(err => {
                        data['sentMail'] = false;
                        results.push(data);

                        /* catch possible errors and throw them with suitable and more understandable error messages*/
                        if (err.toString().includes("Invalid login")) {
                          console.error('\x1b[31m%s\x1b[0m', `Error: ${err.message}\n\nThere is an issue with your login credentials,\
 confirm the credentials (email and password)\
 are correct and that they are properly written in the mailconfig.json.\
 Refer to the README.md for instructions on how to get your login credentials.`);
                        } else if (err.toString().includes("getaddrinfo ENOTFOUND")) {
                          console.error('\x1b[31m%s\x1b[0m', "Error: Unable to esablish smtp connection, check your internet connection");
                        }
                        process.exit(1);
                      });
                  });

                  /* each task is added to an array of tasks */
                  tasks.push(P);
                })
                .on('end', () => {

                  /* executes pending tasks (email dissemination) if they exists (if csv file is not empty) */
                  if (tasks.length > 0) {
                    console.log('\x1b[33m%s\x1b[0m', 'sending emails...');

                    /* trigger promise fulfilment i.e task execution */
                    Promise.all(tasks)
                      .then((val) => console.log('\x1b[32m%s\x1b[0m', 'emails sent!'));
                    resolve(results);
                  } else {
                    console.error('\x1b[31m%s\x1b[0m', "Error: There is no data in the csv file you provided, supply a non-empty csv file");
                    process.exit(1);
                  }
                });
            } else {
              console.error('\x1b[31m%s\x1b[0m', "Error: csv file not found!");
              process.exit(1);
            }
          });
        }
      })  
  } else {
    console.error('\x1b[31m%s\x1b[0m', "Error: message.txt file not found!");
    process.exit(1);
  }
});

p
.catch(err => {
  console.error('\x1b[31m%s\x1b[0m', `Error: ${err}`);
  process.exit(1);
});