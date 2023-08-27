"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const jsonPath = './mailconfig.json';
let name = "";
let email = "";
let password = "";
if (fs_1.default.existsSync(jsonPath)) {
    try {
        const jsonString = fs_1.default.readFileSync(jsonPath, 'utf-8');
        const jsonData = JSON.parse(jsonString);
        if (!("name" in jsonData) || !jsonData['name']) {
            console.error("\x1b[31m%s\x1b[0m", "Error: Please enter your name in the mailconfig.json file");
            process.exit(1);
        }
        else if (!("email" in jsonData) || !jsonData['email']) {
            console.error("\x1b[31m%s\x1b[0m", "Error: Please enter your email in the mailconfig.json file. How do you want this tool to work without it? it's not magic you know...");
            process.exit(1);
        }
        else if (!("password" in jsonData) || !jsonData['password']) {
            console.error("\x1b[31m%s\x1b[0m", "Error: Please enter your third party password in the mailconfig.json file and NOT your email account login password");
            process.exit(1);
        }
        name = jsonData['name'];
        email = jsonData['email'];
        password = jsonData['password'];
    }
    catch (err) {
        console.error("\x1b[31m%s\x1b[0m", `Error: ${err.toString()}`);
    }
}
else {
    console.error("\x1b[31m%s\x1b[0m", "Error: mailconfig.json file not found!");
    process.exit(1);
}
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: email ? email : 'web.chattmessaging@gmail.com',
        pass: password ? password : 'iplptuaoprqkyjkr'
    }
});
const mailer = (email, subject, body) => __awaiter(void 0, void 0, void 0, function* () {
    const mailOptions = {
        from: 'Chatt Instant Messaging',
        to: email,
        subject: subject,
        text: body
    };
    new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("\x1b[31m%s\x1b[0m", `Error: ${error.toString(), error}`);
                ;
            }
            else {
                resolve(info.response);
            }
        });
    })
        .then((response) => {
        console.log('Email sent to ' + email);
    });
});
exports.default = mailer;
