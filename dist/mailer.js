"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const jsonPath = './mailconfig.json';
let Name = "";
let Email = "";
let Password = "";
/* check if mailconfig json file exists */
if (fs_1.default.existsSync(jsonPath)) {
    /* read the mailconfig json file */
    try {
        const jsonString = fs_1.default.readFileSync(jsonPath, 'utf-8');
        const jsonData = JSON.parse(jsonString);
        /* check if the required fields are present and filled otherwise throws respective error */
        if (!("senderName" in jsonData) || !jsonData['senderName']) {
            console.error("\x1b[31m%s\x1b[0m", "Error: sender name misssing. Enter your name in the mailconfig.json file");
            process.exit(1);
        }
        else if (!("email" in jsonData) || !jsonData['email']) {
            console.error("\x1b[31m%s\x1b[0m", "Error: sender email missing. Enter your email in the mailconfig.json file.)");
            process.exit(1);
        }
        else if (!("password" in jsonData) || !jsonData['password']) {
            console.error("\x1b[31m%s\x1b[0m", "Error: password not found. Enter your special app password in the mailconfig.json file and NOT your google account login password");
            process.exit(1);
        }
        Name = jsonData['senderName'].trim();
        Email = jsonData['email'].trim();
        Password = jsonData['password'].trim();
    }
    catch (err) {
        console.error("\x1b[31m%s\x1b[0m", `Error: ${err.toString()}`);
    }
}
else {
    console.error("\x1b[31m%s\x1b[0m", "Error: mailconfig.json file not found!");
    process.exit(1);
}
/* create and configure transporter object */
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: Email,
        pass: Password
    }
});
function mailer({ email, subject, body }) {
    /* create mail options */
    const mailOptions = {
        from: `${Name} <${Email}>`,
        to: email,
        subject: subject,
        text: body
    };
    /* send mail */
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(info.response);
            }
        });
    });
}
exports.default = mailer;
