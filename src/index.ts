// NAME,AGE
//Daffy Duck,24
//Bugs Bunny,22

import csv from 'csv-parser';
import fs from 'fs';

const results: Array<object> = []; 
const path: string = './testdata0.csv'

// if (fs.existsSync(path)) {
//   fs.createReadStream(path)
//     .pipe(csv())
//     .on('data', (data) => {
//       console.log(data);
//       results.push(data);
//     })
//     .on('end', () => console.log(results));
// } else {
//   throw new Error("csv not found!");
// }
const p: Promise<Array<object>> = new Promise((resolve, reject) => {
  if (fs.existsSync(path)) {
    fs.createReadStream(path)
      .pipe(csv())
      .on('data', (data) => {
        data['sentMail'] = false;
        console.log(data);
        results.push(data);
      })
      .on('end', () => {
        console.log(results);
        if (results.length > 0) {
          if ("name" in results[0]) {
            if ("email" in results[0]) {
              if ("company" in results[0]) {
                console.log('sending emails');
              } else {
                console.log("Log: I could not seem to find the 'company' field in the csv file");
                console.error("Error: I could not seem to find the 'company' field in the csv file");
                throw new Error("I could not seem to find the 'company' field in the csv file");
              }
            } else {
              throw new Error("I couldn not seem to find the 'email' field in the csv file");
            }
          } else {
            throw new Error("I could not seem to find the 'name' field in the csv file");
          }
        } else {
         console.log("Uhm, I don't think you put anything useful in the csv file, please do better");
        }
      });
      resolve(results);
  } else {
    reject("csv not found!");
  }
});

p
.then(data => {
  console.log('then', data);
})
.catch(err => {
  throw new Error(err);
})

// if (results.length > 0) {
//   if ("name" in  results[0]) {
//     if ("email" in results[0]) {
//       if ("company" in results[0]) {
//         console.log('sending emails');
//       } else {
//         console.log("Log: I could not seem to find the 'company' field in the csv file");
//         console.error("Error: I could not seem to find the 'company' field in the csv file");
//         throw new Error("I could not seem to find the 'company' field in the csv file");
//       }
//     } else {
//       throw new Error("I couldn not seem to find the 'email' field in the csv file");
//     }
//   } else {
//     throw new Error("I could not seem to find the 'name' field in the csv file");
//   }
// } throw new Error("Uhm, I don't think you put anything useful in the csv file, please do better");