import { IsNotEmpty, IsNumber, IsEnum, Min, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentType } from '@prisma/client';

export class MakePaymentDto {
  @ApiProperty({
    description: 'Loan ID to make payment for',
    example: 'clx1234567890abcdef',
  })
  @IsNotEmpty()
  loanId: string;

  @ApiProperty({
    description: 'Payment amount in Naira',
    example: 5000,
    minimum: 100,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(100, { message: 'Minimum payment amount is ₦100' })
  amount: number;

  @ApiProperty({
    description: 'Payment type',
    enum: PaymentType,
    example: 'LOAN_REPAYMENT',
  })
  @IsNotEmpty()
  @IsEnum(PaymentType)
  type: PaymentType;

  @ApiPropertyOptional({
    description: 'Payment method (card, virtual_account, bank_transfer)',
    example: 'card',
  })
  @IsOptional()
  paymentMethod?: string;

  @ApiPropertyOptional({
    description: 'Additional notes for the payment',
    example: 'Monthly loan repayment',
  })
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Card number (for card payments)',
    example: '4111111111111111',
  })
  @IsOptional()
  cardNumber?: string;

  @ApiPropertyOptional({
    description: 'Card expiry (MM/YY)',
    example: '12/34',
  })
  @IsOptional()
  expiry?: string;

  @ApiPropertyOptional({
    description: 'Card CVV',
    example: '123',
  })
  @IsOptional()
  cvv?: string;

  @ApiPropertyOptional({
    description: 'Virtual account number (for virtual account payments)',
    example: '1234567890',
  })
  @IsOptional()
  virtualAccountNumber?: string;
}
