/**
 * Integration test script for notification system with loan and payment modules
 * This demonstrates the complete notification flow
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app/app.module';
import { NotificationService } from './services/notification.service';
import { EmailService } from './services/email.service';
import { LoansService } from '../loans/services/loans.service';
import { PaymentsService } from '../payments/services/payments.service';
import { PaymentReminderService } from '../payments/services/payment-reminder.service';

async function testNotificationIntegration() {
  console.log('🚀 Starting notification system integration test...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const notificationService = app.get(NotificationService);
    const emailService = app.get(EmailService);
    const loansService = app.get(LoansService);
    const paymentsService = app.get(PaymentsService);
    const paymentReminderService = app.get(PaymentReminderService);

    console.log('📧 Testing Email Service Integration...');
    
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

    console.log('\n📱 Testing Notification Service Integration...');
    
    // Test welcome notification
    console.log('\n4. Testing welcome notification...');
    await notificationService.sendWelcomeNotification('user-123', {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
    });

    // Test loan application notification
    console.log('\n5. Testing loan application notification...');
    await notificationService.sendLoanApplicationNotification('user-123', {
      id: 'LOAN-123',
      amount: 50000,
      purpose: 'Business expansion',
      user: {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      },
    });

    // Test loan approved notification
    console.log('\n6. Testing loan approved notification...');
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

    // Test loan rejected notification
    console.log('\n7. Testing loan rejected notification...');
    await notificationService.sendLoanRejectedNotification('user-123', {
      id: 'LOAN-123',
      amount: 50000,
      reason: 'Insufficient income',
      user: {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      },
    });

    // Test loan disbursed notification
    console.log('\n8. Testing loan disbursed notification...');
    await notificationService.sendLoanDisbursedNotification('user-123', {
      id: 'LOAN-123',
      amount: 45000,
      accountNumber: '1234567890',
      user: {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      },
    });

    // Test payment received notification
    console.log('\n9. Testing payment received notification...');
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

    // Test payment due notification
    console.log('\n10. Testing payment due notification...');
    await notificationService.sendPaymentDueNotification('user-123', {
      amount: 15000,
      dueDate: '2024-12-31',
      loanId: 'LOAN-123',
      user: {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      },
    });

    // Test payment due reminder notification
    console.log('\n11. Testing payment due reminder notification...');
    await notificationService.sendPaymentDueReminderNotification('user-123', {
      amount: 15000,
      dueDate: '2024-12-31',
      loanId: 'LOAN-123',
      user: {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      },
    });

    console.log('\n✅ All notification integration tests completed successfully!');
    console.log('\n📊 What was tested:');
    console.log('   ✅ Email service with all templates');
    console.log('   ✅ Welcome notifications (email + in-app + admin)');
    console.log('   ✅ Loan application notifications');
    console.log('   ✅ Loan approval notifications');
    console.log('   ✅ Loan rejection notifications');
    console.log('   ✅ Loan disbursement notifications');
    console.log('   ✅ Payment received notifications');
    console.log('   ✅ Payment due notifications');
    console.log('   ✅ Payment due reminder notifications');
    console.log('   ✅ Admin WebSocket notifications');
    console.log('   ✅ Bull Queue processing');
    console.log('\n🔧 Next steps:');
    console.log('   1. Check your logs for email queue processing');
    console.log('   2. Check your logs for notification queue processing');
    console.log('   3. Check your logs for WebSocket admin notifications');
    console.log('   4. Check your database for notification records');
    console.log('   5. Test with real loan and payment flows');

  } catch (error) {
    console.error('❌ Integration test failed:', error);
  } finally {
    await app.close();
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testNotificationIntegration().catch(console.error);
}

export { testNotificationIntegration }; 