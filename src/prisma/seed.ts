import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Everos Fit: Iniciando reset de segurança...');

  // 1. Limpar usuários antigos para garantir que os novos dados entrem limpos
  console.log('🧹 Removendo dados antigos...');
  await prisma.user.deleteMany({
    where: {
      email: { in: ['admin@everosfit.com', 'bh@everosfit.com', 'admin@eufit.com', 'bh@eufit.com'] }
    }
  });

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash('mudar_depois', saltRounds);

  // 2. Criar Usuário Administrador (Everos Fit)
  console.log('👤 Criando Admin...');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@everosfit.com',
      name: 'Daniel Admin',
      password: hashedPassword,
      phone: '5531999999999', // Com o 55 para o Login.tsx funcionar
      currentRole: 'ADMIN',
    },
  });

  // 3. Criar Usuário Franqueado (Everos Fit)
  console.log('🏢 Criando Franqueado...');
  const franchise = await prisma.user.create({
    data: {
      email: 'bh@everosfit.com',
      name: 'Franquia Everos BH',
      password: hashedPassword,
      phone: '5531988887777',
      currentRole: 'FRANCHISEE',
    },
  });

  // 4. Criar Tickets de Teste vinculados aos novos IDs
  console.log('🎫 Gerando tickets...');
  await (prisma as any).ticket.create({
    data: {
      title: 'Disputa de Horário: Everos Centro',
      description: 'Conflito de agenda entre personals.',
      status: 'OPEN',
      type: 'DISPUTE',
      city: 'Belo Horizonte',
      state: 'MG',
      reporterId: franchise.id,
    }
  });

  console.log('✅ Everos Fit: Sistema resetado e pronto para login!');
}

main()
  .catch((e) => {
    console.error('❌ Erro crítico no Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });