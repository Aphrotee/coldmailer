# coldmailer
Coldmailer is a light weight tool that redefines email automation with its streamlined command line interface, designed to effortlessly send emails to countless recipients.

## Installation
Clone the this repository

`$ git clone https://github.com/Aphrotee/coldmailer.git`

Go into the directory:

`$ cd coldmailer`

You need the latest version of nodejs:
Download for [windows](https://nodejs.org/en/download), download for [linux](https://nodejs.org/en/download/package-manager)

`$ npm install`

## Configuration

Create a csv file named `data.csv` containing the fields `name`, `email` and `company`.
A csv file can be created by creating an spreadsheet having the above data fields with [microsoft excel](https://support.microsoft.com/en-au/office/import-or-export-text-txt-or-csv-files-5250ac4c-663c-47ce-937b-339e391393ba#:~:text=Go%20to%20File%20%3E%20Save%20As,or%20CSV%20(Comma%20delimited).) or [google sheets](https://support.ecwid.com/hc/en-us/articles/8578742087580-Opening-and-saving-CSV-files-in-Google-Sheets) and then exporting to csv. Make sure the csv file is named `data.csv` and is located at the root of this folder.

Make sure there are no empty lines in the csv file.

Update the `mailconfig.json` file with the appropriate details.

`email` is the email address to be used to send the emails.

`password` is a 16 - character app password generated on your google account and NOT your google account login password. Here's a [guide to generate an app password](https://support.google.com/accounts/answer/185833?hl=en).

`senderName` is the name that should apper on the email as stating the sender name.

The config file should look like this: `{ "email": "johndoe@gmail.com", "password": "bdunpwsaiebyrtom", "senderName": "John Doe" }`


For the email subject and email body, the contents are to be put in the `subject.txt` and `message.txt` files respectively. The content can be customised for each recipient using the name and company in the  csv file.

Here is an example:

`Hi {name}, I would love an opportunity at {company} to enhance my skills while solving cmoplex problems in the society.`

For a recipient with `name: Anderson, company: Google, email: anderson@gmail.com`, the above will be translated to:

`Hi Anderson, I would love an opportunity at Google to enhance my skills while solving cmoplex problems in the society.`

Incase you're wondering how to include an attatchment, yeah you can't.

But what you can do is to upload that attachment to google drive (or whatever cloudstorage service you use) make it available to anyone to access and include a link to it in the email.

## Usage
Run the following commands:

`$ npm run build`

`$ npm start`

NOTE: Because of the possible internet issues while the program runs, you are limited to sending 100 emails at a time in order to ensure all emails are sent succesfully, so yor csv file should not have more that 100 rows of data.

All errors come with reasons causing them and ways to eliminate such errors.