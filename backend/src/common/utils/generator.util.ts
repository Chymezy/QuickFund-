import { randomBytes } from 'crypto';

export class GeneratorUtil {
  /**
   * Generate a unique account number for QuickFund
   * Format: QF + 12 random digits
   */
  static generateAccountNumber(): string {
    const randomDigits = Math.floor(Math.random() * 1000000000000)
      .toString()
      .padStart(12, '0');
    return `QF${randomDigits}`;
  }

  /**
   * Generate a unique payment reference
   * Format: QF-PAY-YYYYMMDD-HHMMSS-XXXXX
   */
  static generatePaymentReference(): string {
    const now = new Date();
    const dateStr =
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0');
    const timeStr =
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0') +
      now.getSeconds().toString().padStart(2, '0');
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();

    return `QF-PAY-${dateStr}-${timeStr}-${randomStr}`;
  }

  /**
   * Generate a unique transaction ID
   * Format: QF-TXN-XXXXX
   */
  static generateTransactionId(): string {
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `QF-TXN-${randomStr}`;
  }

  /**
   * Generate a unique session ID
   */
  static generateSessionId(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Generate a unique loan ID
   * Format: QF-LOAN-XXXXX
   */
  static generateLoanId(): string {
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `QF-LOAN-${randomStr}`;
  }

  /**
   * Generate a unique notification ID
   * Format: QF-NOTIF-XXXXX
   */
  static generateNotificationId(): string {
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `QF-NOTIF-${randomStr}`;
  }
}
