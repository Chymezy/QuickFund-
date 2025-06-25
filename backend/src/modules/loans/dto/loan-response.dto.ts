import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LoanStatus } from '@prisma/client';

export class PaymentDto {
  @ApiProperty({
    description: 'Payment ID',
    example: 'clx1234567890abcdef',
  })
  id: string;

  @ApiProperty({
    description: 'Loan ID',
    example: 'clx1234567890abcdef',
  })
  loanId: string;

  @ApiProperty({
    description: 'Payment amount',
    example: 5000,
  })
  amount: number;

  @ApiProperty({
    description: 'Payment type',
    example: 'INSTALLMENT',
  })
  type: string;

  @ApiProperty({
    description: 'Payment status',
    example: 'COMPLETED',
  })
  status: string;

  @ApiPropertyOptional({
    description: 'Payment reference',
    example: 'TXN-2024-001',
  })
  reference?: string;

  @ApiPropertyOptional({
    description: 'Payment gateway',
    example: 'PAYSTACK',
  })
  gateway?: string;

  @ApiPropertyOptional({
    description: 'Date when payment was processed',
    example: '2024-01-15T10:30:00Z',
  })
  processedAt?: Date;

  @ApiProperty({
    description: 'Payment due date',
    example: '2024-01-15T10:30:00Z',
  })
  dueDate: Date;

  @ApiPropertyOptional({
    description: 'Date when payment was made',
    example: '2024-01-15T10:30:00Z',
  })
  paidAt?: Date;

  @ApiProperty({
    description: 'Date when payment was created',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when payment was last updated',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: Date;
}

export class LoanResponseDto {
  @ApiProperty({
    description: 'Unique loan identifier',
    example: 'clx1234567890abcdef',
  })
  id: string;

  @ApiProperty({
    description: 'User ID who applied for the loan',
    example: 'clx1234567890abcdef',
  })
  userId: string;

  @ApiProperty({
    description: 'Loan amount in Naira',
    example: 50000,
  })
  amount: number;

  @ApiProperty({
    description: 'Purpose of the loan',
    example: 'Business expansion',
  })
  purpose: string;

  @ApiProperty({
    description: 'Loan term in months',
    example: 12,
  })
  term: number;

  @ApiProperty({
    description: 'Interest rate (decimal)',
    example: 0.15,
  })
  interestRate: number;

  @ApiProperty({
    description: 'Monthly payment amount',
    example: 5000,
  })
  monthlyPayment: number;

  @ApiProperty({
    description: 'Total amount to be repaid',
    example: 60000,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Current loan status',
    enum: LoanStatus,
    example: 'PENDING',
  })
  status: LoanStatus;

  @ApiPropertyOptional({
    description: 'Credit score (0-1000)',
    example: 750,
  })
  score?: number;

  @ApiPropertyOptional({
    description: 'Date when loan was approved',
    example: '2024-01-15T10:30:00Z',
  })
  approvedAt?: Date;

  @ApiPropertyOptional({
    description: 'ID of admin who approved the loan',
    example: 'clx1234567890abcdef',
  })
  approvedBy?: string;

  @ApiPropertyOptional({
    description: 'Date when loan was rejected',
    example: '2024-01-15T10:30:00Z',
  })
  rejectedAt?: Date;

  @ApiPropertyOptional({
    description: 'ID of admin who rejected the loan',
    example: 'clx1234567890abcdef',
  })
  rejectedBy?: string;

  @ApiPropertyOptional({
    description: 'Reason for loan rejection',
    example: 'Insufficient credit score',
  })
  rejectionReason?: string;

  @ApiPropertyOptional({
    description: 'Date when loan was disbursed',
    example: '2024-01-16T10:30:00Z',
  })
  disbursedAt?: Date;

  @ApiPropertyOptional({
    description: 'Loan due date',
    example: '2025-01-15T10:30:00Z',
  })
  dueDate?: Date;

  @ApiPropertyOptional({
    description: 'Remaining balance',
    example: 45000,
  })
  remainingBalance?: number;

  @ApiPropertyOptional({
    description: 'Next payment date',
    example: '2024-02-15T10:30:00Z',
  })
  nextPaymentDate?: Date;

  @ApiPropertyOptional({
    description: 'Payment history for this loan',
    type: [PaymentDto],
  })
  paymentHistory?: PaymentDto[];

  @ApiProperty({
    description: 'Date when loan was created',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when loan was last updated',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: Date;
}
