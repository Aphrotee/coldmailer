import csv from 'csv-parser';
import fs from 'fs';
import mailer from './mailer.js';

const results: Array<object> = []; 
const tasks: Array<Promise<void>> = [];
const path: string = './testdata0.csv'

const p: Promise<Array<object>> = new Promise((resolve, reject) => {
  if (fs.existsSync(path)) {
    fs.createReadStream(path)
      .pipe(csv())
      .on('data', (data) => {
        data['sentMail'] = false;
        if (!("name" in data)) {
          throw new Error("I could not seem to find the 'name' field in the csv file, do something about it");
        } else if (!("email" in data)) {
          throw new Error("I could not seem to find the 'email' field in the csv file, do something about it");
        } else if (!("company" in data)) {
          throw new Error("I could not seem to find the 'company' field in the csv file, do something about it");
        }
        const P: Promise<void> = new Promise<void>((resolve, reject) => {
          const subject: string = `Hello ${data['name']}, welcome to ${data['company']}`;
          const body: string = `<h1>Hello ${data['name']}, welcome to ${data['company']}.</h1>\nI'm just testing this out, so don't mind me.`;
          mailer(data['email'], subject, body)
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
        if (results.length > 0) {
          console.log('sending emails...');
          Promise.all(tasks);
          resolve(results);
        }
      });
  } else {
    reject(new Error("csv not found!"));
  }
});

p
.then(results => {
  console.log('emails sent!\nReport:\n', results);
})
.catch(err => {
  throw err;
});