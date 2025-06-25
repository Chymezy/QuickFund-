import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EmailService, EmailJob } from '../services/email.service';

@Processor('emails')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailService: EmailService) {}

  @Process('send-email')
  async handleEmail(job: Job<EmailJob>) {
    this.logger.log(`Processing email job ${job.id} for ${job.data.to}`);

    try {
      const { to, subject, template, context, type } = job.data;

      // Generate email HTML content
      const htmlContent = this.emailService.generateEmailTemplate(template, context);

      // Simulate email sending (in production, this would integrate with real email services)
      await this.simulateEmailSending(to, subject, htmlContent);

      // Log the email content for demonstration
      this.logger.log(`Email sent successfully to ${to}`);
      this.logger.log(`Subject: ${subject}`);
      this.logger.log(`Type: ${type}`);
      this.logger.log(`Template: ${template}`);

      // In a real implementation, you would:
      // 1. Use a service like SendGrid, AWS SES, or Nodemailer
      // 2. Handle email delivery status
      // 3. Implement retry logic for failed emails
      // 4. Store email logs in database

      return {
        success: true,
        to,
        subject,
        type,
        jobId: job.id,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Error processing email job ${job.id}:`, error);
      throw error;
    }
  }

  private async simulateEmailSending(to: string, subject: string, htmlContent: string): Promise<void> {
    // Simulate network delay and email processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate email service response
    const success = Math.random() > 0.1; // 90% success rate

    if (!success) {
      throw new Error(`Failed to send email to ${to}`);
    }

    // Log email content for demonstration purposes
    this.logger.log(`=== EMAIL SIMULATION ===`);
    this.logger.log(`To: ${to}`);
    this.logger.log(`Subject: ${subject}`);
    this.logger.log(`Content Length: ${htmlContent.length} characters`);
    this.logger.log(`=== END EMAIL SIMULATION ===`);
  }
} 