"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const csv_parser_1 = __importDefault(require("csv-parser"));
const fs_1 = __importDefault(require("fs"));
const mailer_js_1 = __importDefault(require("./mailer.js"));
const results = [];
const tasks = [];
const path = './testdata0.csv';
const p = new Promise((resolve, reject) => {
    if (fs_1.default.existsSync(path)) {
        fs_1.default.createReadStream(path)
            .pipe((0, csv_parser_1.default)())
            .on('data', (data) => {
            data['sentMail'] = false;
            if (!("name" in data)) {
                throw new Error("I could not seem to find the 'name' field in the csv file, do something about it");
            }
            else if (!("email" in data)) {
                throw new Error("I could not seem to find the 'email' field in the csv file, do something about it");
            }
            else if (!("company" in data)) {
                throw new Error("I could not seem to find the 'company' field in the csv file, do something about it");
            }
            const P = new Promise((resolve, reject) => {
                const subject = `Hello ${data['name']}, welcome to ${data['company']}`;
                const body = `<h1>Hello ${data['name']}, welcome to ${data['company']}.</h1>\nI'm just testing this out, so don't mind me.`;
                (0, mailer_js_1.default)(data['email'], subject, body)
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
    }
    else {
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
