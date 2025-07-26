import express, { Request, Response } from 'express';
import multer from 'multer';
import morgan from 'morgan';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { mailer, transporter } from './mailer';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const checkRow = (data: any): string | null => {
    if (Object.keys(data).length === 0 && data.constructor === Object) {
        return "Error: Either the csv file is empty; add some data to it or there is an empty line somewhere in it; remove all empty lines.";
    }
    if (!("name" in data)) {
        return "Error: I could not seem to find the 'name' field in the csv file, fix it.";
    } else if (!("email" in data)) {
        return "Error: I could not seem to find the 'email' field in the csv file, fix it.";
    } else if (!("company" in data)) {
        return "Error: I could not seem to find the 'company' field in the csv file, fix it.";
    }
    return null;
}

const createMailingTask = (data: any, message: string, subject: string): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        const Body: string = message.replace(/\{name\}/g, data['name']).replace(/\{company\}/g, data['company']);
        const Subject: string = subject.replace(/\{name\}/g, data['name']).replace(/\{company\}/g, data['company']);
        
        mailer({ email: data['email'], subject: Subject, body: Body })
            .then(info => {
                console.log('Email sent to ' + data['email']);
                resolve();
            })
            .catch(err => {
                console.error('Failed to send email to ' + data['email'], err);
                reject(err);
            });
    });
}

app.post('/send-emails', upload.single('csvFile'), (req: Request, res: Response) => {
    const { subject, message } = req.body;

    if (!req.file) {
        return res.status(400).send('CSV file is required.');
    }

    if (!subject) {
        return res.status(400).send('Subject is required.');
    }

    if (!message) {
        return res.status(400).send('Message is required.');
    }

    const tasks: Array<Promise<void>> = [];
    const readable = new Readable();
    readable._read = () => {}; // _read is required but you can noop it
    readable.push(req.file.buffer);
    readable.push(null);

    readable
        .pipe(csv())
        .on('data', (data) => {
            const error = checkRow(data);
            if (error) {
                // This will stop processing and send an error response
                readable.destroy(); // Stop reading the stream
                if (!res.headersSent) {
                    res.status(400).send(error);
                }
                return;
            }
            tasks.push(createMailingTask(data, message, subject));
        })
        .on('end', () => {
            if (res.headersSent) return;

            if (tasks.length === 0) {
                return res.status(400).send("CSV file is empty or contains no data.");
            }

            if (tasks.length > 100) {
                return res.status(400).send("Error: The csv file contains more than 100 rows of data, reduce it.");
            }

            Promise.allSettled(tasks)
                .then((results) => {
                    const successful = results.filter(r => r.status === 'fulfilled').length;
                    console.log(`${successful} emails sent!`);
                    res.status(200).send(`${successful} emails sent successfully.`);
                    transporter.close();
                })
                .catch(() => {
                    if (!res.headersSent) {
                        res.status(500).send('An error occurred while sending emails.');
                    }
                });
        })
        .on('error', (err) => {
            if (!res.headersSent) {
                res.status(500).send('Error processing CSV file.');
            }
        });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
