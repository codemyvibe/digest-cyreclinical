import { NewsItem } from "@shared/schema";
import { formatDate } from "../../client/src/lib/utils";
import sgMail from '@sendgrid/mail';

class EmailService {
  constructor() {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn("SendGrid API key not found. Email functionality will be limited.");
    } else {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }
  }

  /**
   * Send a magic link for passwordless login
   */
  async sendMagicLink(
    email: string,
    name: string,
    magicLink: string
  ): Promise<void> {
    console.log(`Sending magic link to ${email}`);
    
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sign in to BioNews Digest</title>
        <style>
          body {
            font-family: 'Inter', Arial, sans-serif;
            line-height: 1.6;
            color: #2C3E50;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #2C3E50;
            color: #ffffff;
            padding: 20px;
            text-align: center;
          }
          .logo {
            font-family: 'Montserrat', sans-serif;
            font-size: 24px;
            font-weight: bold;
            color: #ffffff;
          }
          .login-button {
            display: inline-block;
            background-color: #1ABC9C;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 4px;
            margin-top: 16px;
            font-weight: 600;
          }
          .content {
            padding: 20px;
            background-color: #ffffff;
          }
          .footer {
            padding: 20px;
            background-color: #ECF0F1;
            text-align: center;
            font-size: 12px;
            color: #7F8C8D;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <span>BioNews Digest</span>
            </div>
            <p>Your personalized biotech & pharma news digest</p>
          </div>
          
          <div class="content">
            <h2>Hello ${name},</h2>
            
            <p>Click the button below to sign in to your BioNews Digest account:</p>
            
            <div style="margin-top: 32px; text-align: center;">
              <a href="${magicLink}" class="login-button">
                Sign in to BioNews Digest
              </a>
            </div>
            
            <p style="margin-top: 32px;">This magic link will expire in 30 minutes. If you didn't request this, you can safely ignore this email.</p>
          </div>
          
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} BioNews Digest. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    if (process.env.SENDGRID_API_KEY) {
      try {
        await sgMail.send({
          to: email,
          from: 'news@bionewsdigest.com',
          subject: 'Sign in to BioNews Digest',
          html: emailContent,
        });
        console.log(`Magic link email sent to ${email}`);
      } catch (error) {
        console.error('Error sending magic link email:', error);
        if (error.response) {
          console.error(error.response.body);
        }
        throw new Error('Failed to send magic link email');
      }
    } else {
      console.log("Email content (magic link):");
      console.log(emailContent.substring(0, 500) + "...");
    }
  }
  /**
   * Send verification email to the user
   */
  async sendVerificationEmail(
    email: string,
    name: string,
    verificationUrl: string
  ): Promise<void> {
    console.log(`Sending verification email to ${email}`);
    
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your BioNews Digest account</title>
        <style>
          body {
            font-family: 'Inter', Arial, sans-serif;
            line-height: 1.6;
            color: #2C3E50;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #2C3E50;
            color: #ffffff;
            padding: 20px;
            text-align: center;
          }
          .logo {
            font-family: 'Montserrat', sans-serif;
            font-size: 24px;
            font-weight: bold;
            color: #ffffff;
          }
          .verify-button {
            display: inline-block;
            background-color: #1ABC9C;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 4px;
            margin-top: 16px;
            font-weight: 600;
          }
          .content {
            padding: 20px;
            background-color: #ffffff;
          }
          .footer {
            padding: 20px;
            background-color: #ECF0F1;
            text-align: center;
            font-size: 12px;
            color: #7F8C8D;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <span>BioNews Digest</span>
            </div>
            <p>Your personalized biotech & pharma news digest</p>
          </div>
          
          <div class="content">
            <h2>Hello ${name},</h2>
            
            <p>Thank you for signing up for BioNews Digest. Please verify your email address to access your account and start receiving news updates.</p>
            
            <div style="margin-top: 32px; text-align: center;">
              <a href="${verificationUrl}" class="verify-button">
                Verify My Email
              </a>
            </div>
            
            <p style="margin-top: 32px;">If you didn't create an account with us, you can safely ignore this email.</p>
          </div>
          
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} BioNews Digest. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    if (process.env.SENDGRID_API_KEY) {
      try {
        await sgMail.send({
          to: email,
          from: 'news@bionewsdigest.com',
          subject: 'Verify your BioNews Digest account',
          html: emailContent,
        });
        console.log(`Verification email sent to ${email}`);
      } catch (error) {
        console.error('Error sending verification email:', error);
        if (error.response) {
          console.error(error.response.body);
        }
        throw new Error('Failed to send verification email');
      }
    } else {
      console.log("Email content (verification):");
      console.log(emailContent.substring(0, 500) + "...");
    }
  }
  
  /**
   * Send welcome digest with initial news and verification link
   */
  async sendWelcomeDigest(
    email: string,
    name: string,
    newsItems: NewsItem[],
    verificationUrl: string
  ): Promise<void> {
    console.log(`Sending welcome digest to ${email}`);
    
    // Format news items for email
    const newsContent = newsItems.map(item => `
      <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #ECF0F1;">
        <div style="margin-bottom: 10px;">
          <span style="background-color: #3498DB20; color: #3498DB; font-size: 12px; font-weight: 600; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">
            ${item.category}
          </span>
          <span style="font-size: 12px; color: #7F8C8D;">
            ${formatDate(new Date(item.publishedAt))}
          </span>
        </div>
        <h3 style="font-family: 'Montserrat', sans-serif; font-weight: 500; font-size: 18px; color: #2C3E50; margin-bottom: 8px;">
          ${item.title}
        </h3>
        <p style="color: #5D6D7E; margin-bottom: 12px;">
          ${item.summary}
        </p>
        <a href="${item.sourceUrl}" style="color: #3498DB; text-decoration: none; font-size: 14px; font-weight: 500; display: inline-flex; align-items: center;">
          Read original article
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </a>
      </div>
    `).join('');
    
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to BioNews Digest</title>
        <style>
          body {
            font-family: 'Inter', Arial, sans-serif;
            line-height: 1.6;
            color: #2C3E50;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #2C3E50;
            color: #ffffff;
            padding: 20px;
            text-align: center;
          }
          .logo {
            font-family: 'Montserrat', sans-serif;
            font-size: 24px;
            font-weight: bold;
            color: #ffffff;
          }
          .verify-button {
            display: inline-block;
            background-color: #1ABC9C;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 4px;
            margin-top: 16px;
            font-weight: 600;
          }
          .content {
            padding: 20px;
            background-color: #ffffff;
          }
          .footer {
            padding: 20px;
            background-color: #ECF0F1;
            text-align: center;
            font-size: 12px;
            color: #7F8C8D;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <span>BioNews Digest</span>
            </div>
            <p>Your personalized biotech & pharma news digest</p>
            <a href="${verificationUrl}" class="verify-button">
              Verify My Email
            </a>
          </div>
          
          <div class="content">
            <h2>Welcome to BioNews Digest, ${name}!</h2>
            
            <p>Thank you for signing up. To start receiving regular news digests, please verify your email by clicking the button above.</p>
            
            <p>Here's a sample of today's top biotech & pharma news:</p>
            
            <div style="margin-top: 24px;">
              ${newsContent}
            </div>
            
            <div style="margin-top: 32px; text-align: center;">
              <a href="${verificationUrl}" style="display: inline-block; background-color: #1ABC9C; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: 600;">
                Verify My Email to Receive Daily Updates
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} BioNews Digest. All rights reserved.</p>
            <p>
              You received this email because you signed up for BioNews Digest. If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    if (process.env.SENDGRID_API_KEY) {
      try {
        await sgMail.send({
          to: email,
          from: 'news@bionewsdigest.com',
          subject: 'Welcome to BioNews Digest',
          html: emailContent,
        });
        console.log(`Welcome digest email sent to ${email}`);
      } catch (error: any) {
        console.error('Error sending welcome digest email:', error);
        if (error.response) {
          console.error(error.response.body);
        }
        throw new Error('Failed to send welcome digest email');
      }
    } else {
      console.log("Email content (welcome digest):");
      console.log(emailContent.substring(0, 500) + "...");
    }
  }
  
  /**
   * Send regular news digest to verified users
   */
  async sendNewsDigest(
    email: string,
    name: string,
    newsItems: NewsItem[]
  ): Promise<void> {
    console.log(`Sending news digest to ${email}`);
    
    // Format news items for email
    const newsContent = newsItems.map(item => `
      <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #ECF0F1;">
        <div style="margin-bottom: 10px;">
          <span style="background-color: #3498DB20; color: #3498DB; font-size: 12px; font-weight: 600; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">
            ${item.category}
          </span>
          <span style="font-size: 12px; color: #7F8C8D;">
            ${formatDate(new Date(item.publishedAt))}
          </span>
        </div>
        <h3 style="font-family: 'Montserrat', sans-serif; font-weight: 500; font-size: 18px; color: #2C3E50; margin-bottom: 8px;">
          ${item.title}
        </h3>
        <p style="color: #5D6D7E; margin-bottom: 12px;">
          ${item.summary}
        </p>
        <a href="${item.sourceUrl}" style="color: #3498DB; text-decoration: none; font-size: 14px; font-weight: 500; display: inline-flex; align-items: center;">
          Read original article
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </a>
      </div>
    `).join('');
    
    // In a real application, this would use an actual email service like Resend
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your BioNews Digest for ${formatDate(new Date())}</title>
        <style>
          body {
            font-family: 'Inter', Arial, sans-serif;
            line-height: 1.6;
            color: #2C3E50;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #2C3E50;
            color: #ffffff;
            padding: 20px;
            text-align: center;
          }
          .logo {
            font-family: 'Montserrat', sans-serif;
            font-size: 24px;
            font-weight: bold;
            color: #ffffff;
          }
          .content {
            padding: 20px;
            background-color: #ffffff;
          }
          .footer {
            padding: 20px;
            background-color: #ECF0F1;
            text-align: center;
            font-size: 12px;
            color: #7F8C8D;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <span>BioNews Digest</span>
            </div>
            <p>Your personalized biotech & pharma news digest</p>
          </div>
          
          <div class="content">
            <h2>Hello ${name},</h2>
            
            <p>Here are today's most important biotech & pharma industry developments:</p>
            
            <div style="margin-top: 24px;">
              ${newsContent}
            </div>
          </div>
          
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} BioNews Digest. All rights reserved.</p>
            <p>
              You're receiving this email because you're subscribed to BioNews Digest. 
              <a href="#unsubscribe" style="color: #3498DB;">Unsubscribe</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    console.log("Digest email content HTML format (truncated):");
    console.log(emailContent.substring(0, 500) + "...");
    
    // Simulate API call
    return Promise.resolve();
  }
}

export const emailService = new EmailService();
