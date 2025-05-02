// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';

// Compute __dirname equivalent in ES module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from project root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const msg = {
  to: 'aabdulshakur@gmail.com', // Change to your recipient
  from: 'digest@cyreclinical.com', // Use verified sender from env
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
}
sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent');
  })
  .catch((error: any) => {
    console.error(error);
  });