import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export interface EmailJob {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
  type: 'welcome' | 'loan_approved' | 'loan_rejected' | 'payment_received' | 'payment_due' | 'loan_disbursed';
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @InjectQueue('emails') private readonly emailQueue: Queue,
  ) {}

  async sendWelcomeEmail(userEmail: string, userData: { firstName: string; lastName: string }) {
    const job = await this.emailQueue.add('send-email', {
      to: userEmail,
      subject: 'Welcome to QuickFund! 🎉',
      template: 'welcome',
      context: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`,
      },
      type: 'welcome',
    } as EmailJob);

    this.logger.log(`Welcome email queued for ${userEmail} with job ID: ${job.id}`);
    return job;
  }

  async sendLoanApprovedEmail(userEmail: string, loanData: { 
    firstName: string; 
    loanAmount: number; 
    loanId: string;
    approvedAmount: number;
  }) {
    const job = await this.emailQueue.add('send-email', {
      to: userEmail,
      subject: '🎉 Your Loan Has Been Approved!',
      template: 'loan_approved',
      context: {
        firstName: loanData.firstName,
        loanAmount: loanData.loanAmount,
        approvedAmount: loanData.approvedAmount,
        loanId: loanData.loanId,
        dashboardUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`,
      },
      type: 'loan_approved',
    } as EmailJob);

    this.logger.log(`Loan approved email queued for ${userEmail} with job ID: ${job.id}`);
    return job;
  }

  async sendLoanRejectedEmail(userEmail: string, loanData: { 
    firstName: string; 
    loanAmount: number; 
    loanId: string;
    reason?: string;
  }) {
    const job = await this.emailQueue.add('send-email', {
      to: userEmail,
      subject: 'Loan Application Update',
      template: 'loan_rejected',
      context: {
        firstName: loanData.firstName,
        loanAmount: loanData.loanAmount,
        loanId: loanData.loanId,
        reason: loanData.reason || 'We were unable to approve your loan application at this time.',
        supportUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/support`,
      },
      type: 'loan_rejected',
    } as EmailJob);

    this.logger.log(`Loan rejected email queued for ${userEmail} with job ID: ${job.id}`);
    return job;
  }

  async sendPaymentReceivedEmail(userEmail: string, paymentData: { 
    firstName: string; 
    amount: number; 
    loanId: string;
    paymentId: string;
  }) {
    const job = await this.emailQueue.add('send-email', {
      to: userEmail,
      subject: '💰 Payment Received Successfully!',
      template: 'payment_received',
      context: {
        firstName: paymentData.firstName,
        amount: paymentData.amount,
        loanId: paymentData.loanId,
        paymentId: paymentData.paymentId,
        dashboardUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`,
      },
      type: 'payment_received',
    } as EmailJob);

    this.logger.log(`Payment received email queued for ${userEmail} with job ID: ${job.id}`);
    return job;
  }

  async sendPaymentDueEmail(userEmail: string, paymentData: { 
    firstName: string; 
    amount: number; 
    dueDate: string;
    loanId: string;
  }) {
    const job = await this.emailQueue.add('send-email', {
      to: userEmail,
      subject: '⚠️ Payment Due Reminder',
      template: 'payment_due',
      context: {
        firstName: paymentData.firstName,
        amount: paymentData.amount,
        dueDate: paymentData.dueDate,
        loanId: paymentData.loanId,
        paymentUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payments`,
      },
      type: 'payment_due',
    } as EmailJob);

    this.logger.log(`Payment due email queued for ${userEmail} with job ID: ${job.id}`);
    return job;
  }

  async sendLoanDisbursedEmail(userEmail: string, loanData: { 
    firstName: string; 
    amount: number; 
    loanId: string;
    accountNumber: string;
  }) {
    const job = await this.emailQueue.add('send-email', {
      to: userEmail,
      subject: '💸 Loan Disbursed to Your Account!',
      template: 'loan_disbursed',
      context: {
        firstName: loanData.firstName,
        amount: loanData.amount,
        loanId: loanData.loanId,
        accountNumber: loanData.accountNumber,
        dashboardUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`,
      },
      type: 'loan_disbursed',
    } as EmailJob);

    this.logger.log(`Loan disbursed email queued for ${userEmail} with job ID: ${job.id}`);
    return job;
  }

  generateEmailTemplate(template: string, context: Record<string, any>): string {
    const templates = {
      welcome: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to QuickFund!</h1>
            </div>
            <div class="content">
              <h2>Hello ${context.firstName}!</h2>
              <p>Welcome to QuickFund! We're excited to have you on board.</p>
              <p>Your account has been successfully created and you can now:</p>
              <ul>
                <li>Apply for quick loans</li>
                <li>Track your loan status</li>
                <li>Make secure payments</li>
                <li>Access your virtual account</li>
              </ul>
              <a href="${context.loginUrl}" class="button">Login to Your Account</a>
              <p>If you have any questions, feel free to reach out to our support team.</p>
            </div>
            <div class="footer">
              <p>© 2024 QuickFund. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      loan_approved: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight { background: #e8f5e8; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745; }
            .button { display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Loan Approved!</h1>
            </div>
            <div class="content">
              <h2>Congratulations ${context.firstName}!</h2>
              <p>Great news! Your loan application has been approved.</p>
              <div class="highlight">
                <h3>Loan Details:</h3>
                <p><strong>Loan ID:</strong> ${context.loanId}</p>
                <p><strong>Requested Amount:</strong> ₦${context.loanAmount.toLocaleString()}</p>
                <p><strong>Approved Amount:</strong> ₦${context.approvedAmount.toLocaleString()}</p>
              </div>
              <p>The funds will be disbursed to your virtual account within 24 hours.</p>
              <a href="${context.dashboardUrl}" class="button">View Your Dashboard</a>
            </div>
            <div class="footer">
              <p>© 2024 QuickFund. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      loan_rejected: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight { background: #ffeaea; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545; }
            .button { display: inline-block; background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Loan Application Update</h1>
            </div>
            <div class="content">
              <h2>Hello ${context.firstName},</h2>
              <p>We regret to inform you that your loan application could not be approved at this time.</p>
              <div class="highlight">
                <h3>Application Details:</h3>
                <p><strong>Loan ID:</strong> ${context.loanId}</p>
                <p><strong>Requested Amount:</strong> ₦${context.loanAmount.toLocaleString()}</p>
                <p><strong>Reason:</strong> ${context.reason}</p>
              </div>
              <p>You can apply again in 30 days or contact our support team for assistance.</p>
              <a href="${context.supportUrl}" class="button">Contact Support</a>
            </div>
            <div class="footer">
              <p>© 2024 QuickFund. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      payment_received: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #17a2b8 0%, #6f42c1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight { background: #e8f4f8; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #17a2b8; }
            .button { display: inline-block; background: #17a2b8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💰 Payment Received!</h1>
            </div>
            <div class="content">
              <h2>Thank you ${context.firstName}!</h2>
              <p>We have successfully received your payment.</p>
              <div class="highlight">
                <h3>Payment Details:</h3>
                <p><strong>Payment ID:</strong> ${context.paymentId}</p>
                <p><strong>Amount:</strong> ₦${context.amount.toLocaleString()}</p>
                <p><strong>Loan ID:</strong> ${context.loanId}</p>
                <p><strong>Status:</strong> ✅ Confirmed</p>
              </div>
              <p>Your payment has been applied to your loan balance.</p>
              <a href="${context.dashboardUrl}" class="button">View Your Dashboard</a>
            </div>
            <div class="footer">
              <p>© 2024 QuickFund. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      payment_due: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight { background: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
            .button { display: inline-block; background: #ffc107; color: #333; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Payment Due Reminder</h1>
            </div>
            <div class="content">
              <h2>Hello ${context.firstName},</h2>
              <p>This is a friendly reminder that you have a payment due soon.</p>
              <div class="highlight">
                <h3>Payment Details:</h3>
                <p><strong>Amount Due:</strong> ₦${context.amount.toLocaleString()}</p>
                <p><strong>Due Date:</strong> ${context.dueDate}</p>
                <p><strong>Loan ID:</strong> ${context.loanId}</p>
              </div>
              <p>Please make your payment on time to avoid any late fees or penalties.</p>
              <a href="${context.paymentUrl}" class="button">Make Payment Now</a>
            </div>
            <div class="footer">
              <p>© 2024 QuickFund. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      loan_disbursed: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight { background: #e8f5e8; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745; }
            .button { display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💸 Loan Disbursed!</h1>
            </div>
            <div class="content">
              <h2>Great news ${context.firstName}!</h2>
              <p>Your loan has been successfully disbursed to your account.</p>
              <div class="highlight">
                <h3>Disbursement Details:</h3>
                <p><strong>Amount:</strong> ₦${context.amount.toLocaleString()}</p>
                <p><strong>Loan ID:</strong> ${context.loanId}</p>
                <p><strong>Account Number:</strong> ${context.accountNumber}</p>
                <p><strong>Status:</strong> ✅ Disbursed</p>
              </div>
              <p>The funds are now available in your virtual account for use.</p>
              <a href="${context.dashboardUrl}" class="button">View Your Account</a>
            </div>
            <div class="footer">
              <p>© 2024 QuickFund. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    return templates[template] || templates.welcome;
  }
} 