import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Semeando dados iniciais...');

  // 1. Criar Usuário Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@eufit.com' },
    update: {},
    create: {
      email: 'admin@eufit.com',
      name: 'Daniel Admin',
      password: 'mudar_depois', // Idealmente usar hash aqui
      phone: '31999998888',
      currentRole: 'ADMIN',
    },
  });

  // 2. Criar Usuário Franqueado
  const franchise = await prisma.user.upsert({
    where: { email: 'bh@eufit.com' },
    update: {},
    create: {
      email: 'bh@eufit.com',
      name: 'Franquia Belo Horizonte',
      password: 'mudar_depois',
      phone: '31988887777',
      currentRole: 'FRANCHISEE',
    },
  });

  // 3. Criar Tickets de Teste (Suporte e Disputa)
  await prisma.ticket.create({
    data: {
      title: 'Erro no Checkout PIX',
      description: 'O QR Code não está sendo gerado na tela final do aluno.',
      status: 'OPEN',
      type: 'SUPPORT',
      reporterId: admin.id,
    }
  });

  await prisma.ticket.create({
    data: {
      title: 'Disputa: Reserva Duplicada',
      description: 'Dois personals tentaram reservar o Space 01 no mesmo horário.',
      status: 'OPEN',
      type: 'DISPUTE',
      city: 'Belo Horizonte',
      state: 'MG',
      reporterId: franchise.id,
    }
  });

  console.log('✅ Banco populado com sucesso!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });