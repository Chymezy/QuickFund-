/**
 * Test script to demonstrate the notification system
 * This can be run to test email notifications, WebSocket, and queue processing
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app/app.module';
import { NotificationService } from './services/notification.service';
import { EmailService } from './services/email.service';

async function testNotifications() {
  console.log('🚀 Starting notification system test...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const notificationService = app.get(NotificationService);
    const emailService = app.get(EmailService);

    console.log('📧 Testing Email Service...');
    
    // Test welcome email
    console.log('\n1. Testing welcome email...');
    await emailService.sendWelcomeEmail('test@example.com', {
      firstName: 'John',
      lastName: 'Doe',
    });

    // Test loan approved email
    console.log('\n2. Testing loan approved email...');
    await emailService.sendLoanApprovedEmail('test@example.com', {
      firstName: 'John',
      loanAmount: 50000,
      approvedAmount: 45000,
      loanId: 'LOAN-123',
    });

    // Test payment received email
    console.log('\n3. Testing payment received email...');
    await emailService.sendPaymentReceivedEmail('test@example.com', {
      firstName: 'John',
      amount: 10000,
      loanId: 'LOAN-123',
      paymentId: 'PAY-456',
    });

    console.log('\n📱 Testing Notification Service...');
    
    // Test welcome notification
    console.log('\n4. Testing welcome notification...');
    await notificationService.sendWelcomeNotification('user-123', {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
    });

    // Test loan approved notification
    console.log('\n5. Testing loan approved notification...');
    await notificationService.sendLoanApprovedNotification('user-123', {
      id: 'LOAN-123',
      amount: 50000,
      approvedAmount: 45000,
      user: {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      },
    });

    // Test payment received notification
    console.log('\n6. Testing payment received notification...');
    await notificationService.sendPaymentReceivedNotification('user-123', {
      id: 'PAY-456',
      amount: 10000,
      loanId: 'LOAN-123',
      user: {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      },
    });

    console.log('\n✅ All notification tests completed successfully!');
    console.log('\n📊 Check your logs for:');
    console.log('   - Email queue processing');
    console.log('   - Notification queue processing');
    console.log('   - WebSocket admin notifications');
    console.log('   - Database notification records');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await app.close();
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testNotifications().catch(console.error);
}

export { testNotifications }; 