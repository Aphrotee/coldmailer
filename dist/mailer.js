"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const throwError_js_1 = __importDefault(require("./throwError.js"));
const jsonPath = './mailconfig.json';
let credentials = { 'Name': '', 'Email': '', 'Password': '' };
function extractCredentials(jsonData) {
    /* check if the required fields are present and filled then extracts credentials otherwise throws respective error */
    if (!("senderName" in jsonData) || !jsonData['senderName']) {
        (0, throwError_js_1.default)("Error: sender name misssing. Enter your name in the mailconfig.json file.");
    }
    else if (!("email" in jsonData) || !jsonData['email']) {
        (0, throwError_js_1.default)("Error: sender email missing. Enter your email in the mailconfig.json file.");
    }
    else if (!("password" in jsonData) || !jsonData['password']) {
        (0, throwError_js_1.default)("Error: password not found. Enter your special app password in the mailconfig.json file\
 and NOT your google account login password, refer to the README.md for a guide on how to generate yours.");
    }
    const Name = jsonData['senderName'].trim();
    const Email = jsonData['email'].trim();
    const Password = jsonData['password'].trim();
    return { Name, Email, Password };
}
(function parseJSON() {
    /* check if mailconfig json file exists */
    if (fs_1.default.existsSync(jsonPath)) {
        /* read the mailconfig json file */
        try {
            const jsonString = fs_1.default.readFileSync(jsonPath, 'utf-8');
            const jsonData = JSON.parse(jsonString);
            /* attempts to extract credentials */
            credentials = extractCredentials(jsonData);
        }
        catch (err) {
            (0, throwError_js_1.default)(`Error: ${err.toString()}`);
        }
    }
    else {
        (0, throwError_js_1.default)("Error: mailconfig.json file not found!");
    }
})();
/* create and configure transporter object */
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: credentials['Email'],
        pass: credentials['Password']
    }
});
function mailer({ email, subject, body }) {
    /* create mail options */
    const mailOptions = {
        from: `${credentials['Name']} <${credentials['Email']}>`,
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
