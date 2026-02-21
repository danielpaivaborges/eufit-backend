import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Everos Fit: Gerando acessos compatíveis com o Mobile...');

  // Gerando Hash da senha para o NestJS aceitar
  const hashedPassword = await bcrypt.hash('mudar_depois', 10);

  // 1. Admin (Acesso Total)
  await prisma.user.upsert({
    where: { email: 'admin@everosfit.com' },
    update: { phone: '5531999999999', password: hashedPassword },
    create: {
      email: 'admin@everosfit.com',
      name: 'Daniel Admin',
      password: hashedPassword,
      phone: '5531999999999',
      currentRole: 'ADMIN',
    },
  });

  // 2. Franqueado (Visão Regional)
  await prisma.user.upsert({
    where: { email: 'bh@everosfit.com' },
    update: { phone: '5531988887777', password: hashedPassword },
    create: {
      email: 'bh@everosfit.com',
      name: 'Franquia Everos BH',
      password: hashedPassword,
      phone: '5531988887777',
      currentRole: 'FRANCHISEE',
    },
  });

  console.log('✅ Everos Fit: Seed finalizado!');
}

main().catch(console.error).finally(() => prisma.$disconnect());