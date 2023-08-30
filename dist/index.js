"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const csv_parser_1 = __importDefault(require("csv-parser"));
const fs_1 = __importDefault(require("fs"));
const mailer_js_1 = __importDefault(require("./mailer.js"));
const readline_1 = __importDefault(require("readline"));
const throwError_js_1 = __importDefault(require("./throwError.js"));
class Coldmailer {
    constructor() {
        this.results = [];
        this.tasks = [];
        this.subject = '';
        this.message = '';
        this.dataPath = './data.csv';
        this.messagePath = './message.txt';
        this.subjectPath = './subject.txt';
        this.readline = this.readlineConfig();
    }
    readlineConfig() {
        return readline_1.default.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }
    createMailingTask(data) {
        /* a Promise is used to create a mail dispatch task for each recipient in the csv file */
        return new Promise((resolve, reject) => {
            /* create customized subject and email body for each recipient */
            const Body = this.message.replace(/\{name\}/g, data['name']).replace(/\{company\}/g, data['company']);
            const Subject = this.subject.replace(/\{name\}/g, data['name']).replace(/\{company\}/g, data['company']);
            (0, mailer_js_1.default)({ email: data['email'], subject: Subject, body: Body })
                .then(info => {
                console.log('Email sent to ' + data['email']);
                this.results.push(data);
                resolve();
            })
                .catch(err => {
                this.results.push(data);
                /* catch possible errors when sending emails and throw them with suitable and more understandable error messages */
                if (err.toString().includes("Invalid login")) {
                    (0, throwError_js_1.default)(`Error: ${err.message}\n\nThere is an issue with your login credentials,\
 confirm the credentials (email and password)\
 are correct and that they are properly written in the mailconfig.json.\
 Refer to the README.md for instructions on how to get your login credentials.`);
                }
                else if (err.toString().includes("getaddrinfo ENOTFOUND")) {
                    (0, throwError_js_1.default)("Error: Unable to esablish smtp connection, check your internet connection.");
                }
            });
        });
    }
    checkRow(data) {
        /* checks if the csv file is empty or contains empty lines */
        if (Object.keys(data).length === 0 && data.constructor === Object) {
            (0, throwError_js_1.default)("Error: Either the csv file is empty; add some data to it or there is an empty line somewhere in it; remove all empty lines.");
        }
        /* check if the required fields are present otherwise throws respective error */
        if (!("name" in data)) {
            (0, throwError_js_1.default)("Error: I could not seem to find the 'name' field in the csv file, fix it.");
        }
        else if (!("email" in data)) {
            (0, throwError_js_1.default)("Error: I could not seem to find the 'email' field in the csv file, fix it.");
        }
        else if (!("company" in data)) {
            (0, throwError_js_1.default)("Error: I could not seem to find the 'company' field in the csv file, fix it.");
        }
    }
    parseCSV() {
        /* check if the recipients csv file exists */
        if (fs_1.default.existsSync(this.dataPath)) {
            fs_1.default.createReadStream(this.dataPath)
                .pipe((0, csv_parser_1.default)())
                .on('data', (data) => {
                /* checks current row if there are any errors of if csv file is empty */
                this.checkRow(data);
                /* create mailing task for current */
                const P = this.createMailingTask(data);
                /* each task is added to an array of tasks */
                this.tasks.push(P);
            })
                .on('end', () => {
                /* executes pending tasks (email dissemination) if they exists (if csv file is not empty) */
                if (this.tasks.length > 0) {
                    console.log('\x1b[33m%s\x1b[0m', 'sending emails...');
                    /* trigger promise fulfilment i.e task execution */
                    Promise.all(this.tasks)
                        .then((val) => console.log('\x1b[32m%s\x1b[0m', 'emails sent!'));
                }
                else {
                    (0, throwError_js_1.default)("Error: There is no data in the csv file you provided, supply a non-empty csv file.");
                }
            });
        }
        else {
            (0, throwError_js_1.default)("Error: csv file not found!");
        }
    }
    parseSubject() {
        /* check if the subject text file exists */
        if (fs_1.default.existsSync(this.subjectPath)) {
            this.subject = fs_1.default.readFileSync(this.subjectPath, 'utf-8').toString().trim();
            if (!this.subject) {
                /* throw error when message.txt file is empty */
                (0, throwError_js_1.default)("Error: subject.txt file is empty, give your email a subject in the subject.txt file.");
            }
        }
        else {
            /* throw error when message.txt file does not exist */
            (0, throwError_js_1.default)("Error: subject.txt file not found!");
        }
    }
    showExample() {
        /* show the user what theb message would look like when customised and sent */
        const fakeName = "Anderson";
        const fakeCompany = "Google";
        /* remove leading and trailing whitespace */
        this.message = this.message.trim();
        const exampleMessage = this.message.replace(/\{name\}/g, fakeName).replace(/\{company\}/g, fakeCompany);
        console.log(exampleMessage);
        console.log('\x1b[33m%s\x1b[0m', "\nAbove is an example of the message to be customised and sent to each recipient, do you wish to proceed?");
    }
    execute(arg) {
        /* receive input from stdin on whether the user is satisfied with the way the messae looks and wants to proceed to sending it */
        if (!(arg === 'Y' || arg === 'y')) {
            process.exit();
        }
        this.readline.close();
        /* parse subject text file and process it's content */
        this.parseSubject();
        /* parse csv file and process it's coontent */
        this.parseCSV();
    }
    start() {
        /* entry point */
        return new Promise((resolve, reject) => {
            /* check if the message text file exists */
            if (fs_1.default.existsSync(this.messagePath)) {
                fs_1.default.createReadStream(this.messagePath)
                    .on('data', (data) => {
                    /* the message text is split into chunks and each chunk of data read is put together */
                    this.message += data;
                })
                    .on('end', () => {
                    if (!this.message) {
                        /* throw error when message.txt file is empty */
                        (0, throwError_js_1.default)("Error: You did not put a message to be sent in the message.txt file\n\
Write something in the message.txt, a guide can be found in the README.md at the root of this folder.");
                    }
                    else {
                        /* show the user a customized example of what will be sent out */
                        this.showExample();
                        /* prompts user to proceed to sending mails or not */
                        this.readline.question("Type 'Y' to continue, and any other key to not: ", (arg) => {
                            /* continues to parse other files and send mails */
                            this.execute(arg);
                        });
                    }
                });
            }
            else {
                (0, throwError_js_1.default)("Error: message.txt file not found!");
            }
        });
    }
}
const coldmailer = new Coldmailer();
coldmailer.start();
