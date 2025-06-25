import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'demo-admin@quickfund.com';
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.admin.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'Admin',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('Admin created:', admin);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}); 