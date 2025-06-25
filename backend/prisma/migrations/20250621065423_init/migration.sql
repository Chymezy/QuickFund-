-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('EMPLOYED', 'SELF_EMPLOYED', 'UNEMPLOYED', 'STUDENT', 'RETIRED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('ID_CARD', 'UTILITY_BILL', 'BANK_STATEMENT', 'PAYSLIP', 'EMPLOYMENT_LETTER', 'OTHER');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'DISBURSED', 'ACTIVE', 'COMPLETED', 'DEFAULTED');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('LOAN_REPAYMENT', 'LATE_FEE', 'PROCESSING_FEE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('LOAN_APPROVED', 'LOAN_REJECTED', 'PAYMENT_DUE', 'PAYMENT_RECEIVED', 'LOAN_DISBURSED', 'SYSTEM_ALERT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "country" TEXT DEFAULT 'Nigeria',
    "employmentStatus" "EmploymentStatus",
    "employerName" TEXT,
    "monthlyIncome" DECIMAL(10,2),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "purpose" TEXT NOT NULL,
    "term" INTEGER NOT NULL,
    "interestRate" DECIMAL(5,4) NOT NULL,
    "monthlyPayment" DECIMAL(10,2) NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "status" "LoanStatus" NOT NULL DEFAULT 'PENDING',
    "score" INTEGER,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectedBy" TEXT,
    "rejectionReason" TEXT,
    "disbursedAt" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "type" "PaymentType" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "reference" TEXT NOT NULL,
    "gateway" TEXT,
    "gatewayRef" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "virtual_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "bankName" TEXT NOT NULL DEFAULT 'QuickFund Bank',
    "balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "virtual_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_configs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "payments_reference_key" ON "payments"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "virtual_accounts_userId_key" ON "virtual_accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "virtual_accounts_accountNumber_key" ON "virtual_accounts"("accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "system_configs_key_key" ON "system_configs"("key");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_accounts" ADD CONSTRAINT "virtual_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
