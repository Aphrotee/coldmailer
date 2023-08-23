"use strict";
// NAME,AGE
//Daffy Duck,24
//Bugs Bunny,22
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const csv_parser_1 = __importDefault(require("csv-parser"));
const fs_1 = __importDefault(require("fs"));
const results = [];
const path = './testdata0.csv';
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
const p = new Promise((resolve, reject) => {
    if (fs_1.default.existsSync(path)) {
        fs_1.default.createReadStream(path)
            .pipe((0, csv_parser_1.default)())
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
                        }
                        else {
                            console.log("Log: I could not seem to find the 'company' field in the csv file");
                            console.error("Error: I could not seem to find the 'company' field in the csv file");
                            throw new Error("I could not seem to find the 'company' field in the csv file");
                        }
                    }
                    else {
                        throw new Error("I couldn not seem to find the 'email' field in the csv file");
                    }
                }
                else {
                    throw new Error("I could not seem to find the 'name' field in the csv file");
                }
            }
            else {
                console.log("Uhm, I don't think you put anything useful in the csv file, please do better");
            }
        });
        resolve(results);
    }
    else {
        reject("csv not found!");
    }
});
p
    .then(data => {
    console.log('then', data);
})
    .catch(err => {
    throw new Error(err);
});
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
