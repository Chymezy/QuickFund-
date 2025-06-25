import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateApprovedLoans() {
  const result = await prisma.loan.updateMany({
    where: { status: 'APPROVED' },
    data: { status: 'ACTIVE' },
  });
  console.log(`Updated ${result.count} loans from APPROVED to ACTIVE`);
  await prisma.$disconnect();
}

migrateApprovedLoans().catch((e) => {
  console.error(e);
  process.exit(1);
}); 