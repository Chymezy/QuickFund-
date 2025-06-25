import { applyDecorators } from '@nestjs/common';
import {
  IsEmail,
  IsString,
  MinLength,
  Matches,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsEnum,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class ValidationDecorators {
  /**
   * Email validation decorator
   */
  static Email() {
    return applyDecorators(
      ApiProperty({
        example: 'user@example.com',
        description: 'User email address',
      }),
      IsEmail({}, { message: 'Please provide a valid email address' }),
    );
  }

  /**
   * Password validation decorator
   */
  static Password() {
    return applyDecorators(
      ApiProperty({
        example: 'Password123!',
        description:
          'Password (minimum 8 characters, must include uppercase, lowercase, number, and special character)',
      }),
      IsString(),
      MinLength(8, { message: 'Password must be at least 8 characters long' }),
      Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        {
          message:
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        },
      ),
    );
  }

  /**
   * Name validation decorator
   */
  static Name(propertyName: string, example: string) {
    return applyDecorators(
      ApiProperty({
        example,
        description: `User ${propertyName.toLowerCase()}`,
      }),
      IsString(),
      MinLength(2, {
        message: `${propertyName} must be at least 2 characters long`,
      }),
    );
  }

  /**
   * Phone number validation decorator
   */
  static Phone() {
    return applyDecorators(
      ApiPropertyOptional({
        example: '+2348012345678',
        description: 'Phone number in international format',
      }),
      IsOptional(),
      IsString(),
      Matches(/^\+[1-9]\d{1,14}$/, {
        message:
          'Phone number must be in international format (e.g., +2348012345678)',
      }),
    );
  }

  /**
   * Date of birth validation decorator
   */
  static DateOfBirth() {
    return applyDecorators(
      ApiPropertyOptional({
        example: '1990-01-01',
        description: 'Date of birth (YYYY-MM-DD)',
      }),
      IsOptional(),
      IsDateString(),
    );
  }

  /**
   * Address validation decorator
   */
  static Address() {
    return applyDecorators(
      ApiPropertyOptional({
        example: '123 Main St',
        description: 'Street address',
      }),
      IsOptional(),
      IsString(),
      MinLength(5, { message: 'Address must be at least 5 characters long' }),
    );
  }

  /**
   * Location validation decorator (city, state, etc.)
   */
  static Location(propertyName: string, example: string) {
    return applyDecorators(
      ApiPropertyOptional({
        example,
        description: propertyName,
      }),
      IsOptional(),
      IsString(),
    );
  }

  /**
   * Monthly income validation decorator
   */
  static MonthlyIncome() {
    return applyDecorators(
      ApiPropertyOptional({
        example: 150000,
        description: 'Monthly income in Naira',
        minimum: 0,
      }),
      IsOptional(),
      IsNumber(),
      Min(0, { message: 'Monthly income cannot be negative' }),
      Transform(({ value }) => parseFloat(value)),
    );
  }

  /**
   * Terms agreement validation decorator
   */
  static TermsAgreement() {
    return applyDecorators(
      ApiPropertyOptional({
        example: true,
        description: 'Agreement to terms and conditions',
        default: false,
      }),
      IsOptional(),
      IsBoolean(),
      Transform(({ value }) => value === 'true' || value === true),
    );
  }

  /**
   * Amount validation decorator
   */
  static Amount(min: number, max: number, currency: string = 'Naira') {
    return applyDecorators(
      ApiProperty({
        description: `Amount in ${currency}`,
        example: min,
        minimum: min,
        maximum: max,
      }),
      IsNumber(),
      Min(min, {
        message: `Minimum amount is ${currency} ${min.toLocaleString()}`,
      }),
      Max(max, {
        message: `Maximum amount is ${currency} ${max.toLocaleString()}`,
      }),
    );
  }

  /**
   * Term validation decorator
   */
  static Term(min: number, max: number, unit: string = 'months') {
    return applyDecorators(
      ApiProperty({
        description: `Term in ${unit}`,
        example: min,
        minimum: min,
        maximum: max,
      }),
      IsNumber(),
      Min(min, { message: `Minimum term is ${min} ${unit}` }),
      Max(max, { message: `Maximum term is ${max} ${unit}` }),
    );
  }

  /**
   * Enum validation decorator
   */
  static Enum(enumType: any, propertyName: string, example: any) {
    return applyDecorators(
      ApiProperty({
        enum: enumType,
        example,
        description: propertyName,
      }),
      IsEnum(enumType),
    );
  }
}
