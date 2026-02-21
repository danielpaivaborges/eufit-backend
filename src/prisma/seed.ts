import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Everos Fit: Iniciando semeadura de dados...');

  // 1. Criar Usuário Administrador
  const admin = await prisma.user.upsert({
    where: { email: 'admin@everosfit.com' },
    update: {},
    create: {
      email: 'admin@everosfit.com',
      name: 'Daniel Admin',
      password: 'mudar_depois', // Lembre-se de usar hash em produção
      phone: '5531999998888',
      currentRole: 'ADMIN',
    },
  });

  // 2. Criar Usuário Franqueado
  const franchise = await prisma.user.upsert({
    where: { email: 'bh@everosfit.com' },
    update: {},
    create: {
      email: 'bh@everosfit.com',
      name: 'Franquia Everos BH',
      password: 'mudar_depois',
      phone: '5531988887777',
      currentRole: 'FRANCHISEE',
    },
  });

  // 3. Criar Tickets de Exemplo (Suporte e Disputas)
  const ticketsData = [
    {
      title: 'Dificuldade no Acesso',
      description: 'Usuário relata lentidão ao carregar o plano de treinos.',
      status: 'OPEN',
      type: 'SUPPORT',
      reporterId: admin.id,
    },
    {
      title: 'Disputa de Espaço: Unidade Centro',
      description: 'Conflito de agenda entre dois profissionais no Everos Spaces.',
      status: 'OPEN',
      type: 'DISPUTE',
      city: 'Belo Horizonte',
      state: 'MG',
      reporterId: franchise.id,
    }
  ];

  for (const ticket of ticketsData) {
    // Usamos create individual para garantir compatibilidade com o engine
    await (prisma as any).ticket.create({ data: ticket });
  }

  console.log('✅ Everos Fit: Banco de dados populado com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });