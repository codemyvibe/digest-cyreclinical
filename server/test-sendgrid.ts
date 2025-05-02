// Test file for SendGrid
import sgMail from '@sendgrid/mail';

// Make sure SENDGRID_API_KEY is set in the environment
if (!process.env.SENDGRID_API_KEY) {
  console.error('SENDGRID_API_KEY environment variable is not set');
  process.exit(1);
}

// Set your API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Test using your example
const msg = {
  to: 'test@example.com', // Replace with your email for testing
  from: 'test@example.com', // Replace with your verified sender email in SendGrid
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
};

// Send the email
sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent successfully');
  })
  .catch((error) => {
    console.error('Error sending email:');
    console.error(error);
    
    // Log the response body if it exists
    if (error.response) {
      console.error(error.response.body);
    }
  });