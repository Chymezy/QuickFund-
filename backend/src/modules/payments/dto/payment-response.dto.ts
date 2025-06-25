import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus, PaymentType } from '@prisma/client';

export class PaymentResponseDto {
  @ApiProperty({
    description: 'Unique payment identifier',
    example: 'clx1234567890abcdef',
  })
  id: string;

  @ApiProperty({
    description: 'Loan ID associated with this payment',
    example: 'clx1234567890abcdef',
  })
  loanId: string;

  @ApiProperty({
    description: 'Payment amount in Naira',
    example: 5000,
  })
  amount: number;

  @ApiProperty({
    description: 'Payment type',
    enum: PaymentType,
    example: 'LOAN_REPAYMENT',
  })
  type: PaymentType;

  @ApiProperty({
    description: 'Payment status',
    enum: PaymentStatus,
    example: 'COMPLETED',
  })
  status: PaymentStatus;

  @ApiProperty({
    description: 'Unique payment reference',
    example: 'PAY-2024-001',
  })
  reference: string;

  @ApiPropertyOptional({
    description: 'Payment gateway used',
    example: 'paystack',
  })
  gateway?: string;

  @ApiPropertyOptional({
    description: 'Gateway reference number',
    example: 'PS-123456789',
  })
  gatewayRef?: string;

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

  @ApiPropertyOptional({
    description: 'Loan details (for admin views)',
    example: {
      id: 'clx1234567890abcdef',
      user: {
        id: 'clxuser123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      },
    },
  })
  loan?: {
    id: string;
    user?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}
