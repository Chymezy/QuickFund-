import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT refresh token',
  })
  refreshToken: string;

  @ApiProperty({
    example: '7d',
    description: 'Token expiration time',
  })
  expiresIn: string;

  @ApiProperty({
    example: 'Bearer',
    description: 'Token type',
  })
  tokenType: string;

  @ApiProperty({
    example: 'sess_1234567890_abc123def',
    description: 'Session ID for enhanced security',
    required: false,
  })
  sessionId?: string;

  @ApiProperty({
    example: {
      id: 'clx1234567890',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER',
    },
    description: 'User information',
  })
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export class RegisterResponseDto {
  @ApiProperty({
    example: 'clx1234567890',
    description: 'User ID',
  })
  id: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email',
  })
  email: string;

  @ApiProperty({
    example: 'John',
    description: 'User first name',
  })
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
  })
  lastName: string;

  @ApiProperty({
    example: 'USER',
    description: 'User role',
  })
  role: string;

  @ApiProperty({
    example: false,
    description: 'Email verification status',
  })
  isVerified: boolean;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Account creation timestamp',
  })
  createdAt: string;
}

export class ProfileResponseDto {
  @ApiProperty({
    example: 'clx1234567890',
    description: 'User ID',
  })
  id: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email',
  })
  email: string;

  @ApiProperty({
    example: 'John',
    description: 'User first name',
  })
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
  })
  lastName: string;

  @ApiProperty({
    example: '+2348012345678',
    description: 'Phone number',
    nullable: true,
  })
  phone: string | null;

  @ApiProperty({
    example: '1990-01-01',
    description: 'Date of birth',
    nullable: true,
  })
  dateOfBirth: string | null;

  @ApiProperty({
    example: '123 Main St',
    description: 'Address',
    nullable: true,
  })
  address: string | null;

  @ApiProperty({
    example: 'Lagos',
    description: 'City',
    nullable: true,
  })
  city: string | null;

  @ApiProperty({
    example: 'Lagos State',
    description: 'State',
    nullable: true,
  })
  state: string | null;

  @ApiProperty({
    example: '100001',
    description: 'ZIP code',
    nullable: true,
  })
  zipCode: string | null;

  @ApiProperty({
    example: 'Nigeria',
    description: 'Country',
    nullable: true,
  })
  country: string | null;

  @ApiProperty({
    example: 'EMPLOYED',
    description: 'Employment status',
    nullable: true,
  })
  employmentStatus: string | null;

  @ApiProperty({
    example: 'Tech Corp Ltd',
    description: 'Employer name',
    nullable: true,
  })
  employerName: string | null;

  @ApiProperty({
    example: 150000,
    description: 'Monthly income',
    nullable: true,
  })
  monthlyIncome: number | null;

  @ApiProperty({
    example: 'USER',
    description: 'User role',
  })
  role: string;

  @ApiProperty({
    example: true,
    description: 'Account active status',
  })
  isActive: boolean;

  @ApiProperty({
    example: false,
    description: 'Email verification status',
  })
  isVerified: boolean;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Account creation timestamp',
  })
  createdAt: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Last update timestamp',
  })
  updatedAt: string;

  @ApiProperty({
    example: {
      id: 'va_1234567890',
      accountNumber: 'QF123456789012',
      bankName: 'QuickFund Bank',
      balance: 50000,
      isActive: true,
    },
    description: 'Virtual account information',
    nullable: true,
  })
  virtualAccount?: {
    id: string;
    accountNumber: string;
    bankName: string;
    balance: number;
    isActive: boolean;
  } | null;

  @ApiProperty({
    example: [
      {
        id: 'loan_1234567890',
        amount: 100000,
        purpose: 'Business expansion',
        status: 'ACTIVE',
        createdAt: '2024-01-15T10:30:00Z',
      },
    ],
    description: 'Recent loans',
    type: 'array',
  })
  recentLoans?: {
    id: string;
    amount: number;
    purpose: string;
    status: string;
    createdAt: string;
  }[];
}
