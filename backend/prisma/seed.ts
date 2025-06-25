import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@quickfund.com' },
    update: {},
    create: {
      email: 'admin@quickfund.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      phone: '+2348012345678',
      isVerified: true,
      employmentStatus: 'EMPLOYED',
      employerName: 'QuickFund',
      monthlyIncome: 500000,
    },
  });

  // Create regular user
  const user = await prisma.user.upsert({
    where: { email: 'user@quickfund.com' },
    update: {},
    create: {
      email: 'user@quickfund.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER',
      phone: '+2348012345679',
      isVerified: true,
      employmentStatus: 'EMPLOYED',
      employerName: 'Tech Corp',
      monthlyIncome: 150000,
      address: '123 Main St',
      city: 'Lagos',
      state: 'Lagos State',
    },
  });

  // Create sample loans
  const loan1 = await prisma.loan.create({
    data: {
      userId: user.id,
      amount: 50000,
      purpose: 'Business expansion',
      term: 12,
      interestRate: 0.15,
      monthlyPayment: 5000,
      totalAmount: 60000,
      score: 750,
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedBy: admin.id,
    },
  });

  const loan2 = await prisma.loan.create({
    data: {
      userId: user.id,
      amount: 100000,
      purpose: 'Home renovation',
      term: 24,
      interestRate: 0.15,
      monthlyPayment: 5000,
      totalAmount: 120000,
      score: 680,
      status: 'PENDING',
    },
  });

  // Create sample payments
  await prisma.payment.create({
    data: {
      loanId: loan1.id,
      amount: 5000,
      type: 'LOAN_REPAYMENT',
      status: 'COMPLETED',
      reference: 'PAY-001',
      gateway: 'mock',
      processedAt: new Date(),
    },
  });

  // Create virtual account for user
  await prisma.virtualAccount.create({
    data: {
      userId: user.id,
      accountNumber: '1234567890',
      bankName: 'QuickFund Bank',
      balance: 50000,
    },
  });

  // Create sample notifications
  await prisma.notification.create({
    data: {
      userId: user.id,
      type: 'LOAN_APPROVED',
      title: 'Loan Approved',
      message: 'Your loan application for ₦50,000 has been approved!',
    },
  });

  await prisma.notification.create({
    data: {
      userId: user.id,
      type: 'PAYMENT_RECEIVED',
      title: 'Payment Received',
      message: 'Your payment of ₦5,000 has been received successfully.',
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin user: admin@quickfund.com / admin123');
  console.log('👤 Regular user: user@quickfund.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 