import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt'; // Importe o bcrypt

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Everos Fit: Gerando acessos oficiais...');

  const hashedPassword = await bcrypt.hash('mudar_depois', 10);

  // Criar Admin com senha protegida
  await prisma.user.upsert({
    where: { email: 'admin@everosfit.com' },
    update: { password: hashedPassword },
    create: {
      email: 'admin@everosfit.com',
      name: 'Daniel Admin',
      password: hashedPassword,
      phone: '5531999998888',
      currentRole: 'ADMIN',
    },
  });

  console.log('✅ Everos Fit: Usuários prontos para login!');
}

main().catch(console.error).finally(() => prisma.$disconnect());