import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando Seed...');

  // 1. Criar Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@eufit.com' },
    update: {},
    create: {
      email: 'admin@eufit.com',
      name: 'Daniel Admin',
      password: 'hash_da_password', // Em prod, use bcrypt
      currentRole: 'ADMIN',
    },
  });

  // 2. Criar Franqueado
  const franchise = await prisma.user.upsert({
    where: { email: 'bh@eufit.com' },
    update: {},
    create: {
      email: 'bh@eufit.com',
      name: 'Franquia BH',
      password: 'hash_da_password',
      currentRole: 'FRANCHISEE',
    },
  });

  // 3. Criar alguns Tickets de Teste
  await prisma.ticket.createMany({
    data: [
      {
        title: 'Problema no pagamento',
        description: 'O aluno tentou pagar via PIX e não processou.',
        status: 'OPEN',
        type: 'SUPPORT',
        reporterId: admin.id,
      },
      {
        title: 'Disputa de Horário - BH Centro',
        description: 'Dois profissionais reservaram o mesmo espaço às 10h.',
        status: 'OPEN',
        type: 'DISPUTE',
        city: 'Belo Horizonte',
        state: 'MG',
        reporterId: franchise.id,
      },
      {
        title: 'Equipamento Danificado',
        description: 'A passadeira da unidade centro está avariada.',
        status: 'IN_PROGRESS',
        type: 'REPORT',
        city: 'Belo Horizonte',
        state: 'MG',
        reporterId: franchise.id,
      }
    ],
  });

  console.log('✅ Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });