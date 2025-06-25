import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsEnum,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApplyLoanDto {
  @ApiProperty({
    description: 'Loan amount in Naira',
    example: 50000,
    minimum: 10000,
    maximum: 1000000,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(10000, { message: 'Minimum loan amount is ₦10,000' })
  @Max(1000000, { message: 'Maximum loan amount is ₦1,000,000' })
  amount: number;

  @ApiProperty({
    description: 'Purpose of the loan',
    example: 'Business expansion',
    minLength: 10,
    maxLength: 500,
  })
  @IsNotEmpty()
  @IsString()
  purpose: string;

  @ApiProperty({
    description: 'Loan term in months',
    example: 12,
    minimum: 3,
    maximum: 60,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(3, { message: 'Minimum loan term is 3 months' })
  @Max(60, { message: 'Maximum loan term is 60 months' })
  term: number;

  @ApiPropertyOptional({
    description: 'Additional notes for the loan application',
    example: 'I need this loan for my small business expansion',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
