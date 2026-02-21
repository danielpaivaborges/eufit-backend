import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Everos Fit: Iniciando semeadura de dados oficiais...');

  // Gerando o Hash da senha para que o NestJS consiga validar o login
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash('mudar_depois', saltRounds);

  // 1. Criar Usuário Administrador
  // O telefone inclui o prefixo 55 conforme exigido pelo fluxo do Login.tsx
  const admin = await prisma.user.upsert({
    where: { email: 'admin@everosfit.com' },
    update: {
      password: hashedPassword,
      phone: '5531999999999',
    },
    create: {
      email: 'admin@everosfit.com',
      name: 'Daniel Admin',
      password: hashedPassword,
      phone: '5531999999999',
      currentRole: 'ADMIN',
    },
  });

  // 2. Criar Usuário Franqueado
  const franchise = await prisma.user.upsert({
    where: { email: 'bh@everosfit.com' },
    update: {
      password: hashedPassword,
      phone: '5531988887777',
    },
    create: {
      email: 'bh@everosfit.com',
      name: 'Franquia Everos BH',
      password: hashedPassword,
      phone: '5531988887777',
      currentRole: 'FRANCHISEE',
    },
  });

  // 3. Criar Tickets de Suporte e Disputa
  // Usamos create individual para garantir que o Prisma Client processe cada um corretamente
  console.log('🎫 Gerando tickets de teste...');

  await (prisma as any).ticket.create({
    data: {
      title: 'Erro de Sincronização PIX',
      description: 'O aluno pagou mas o status na Everos Fit não atualizou.',
      status: 'OPEN',
      type: 'SUPPORT',
      reporterId: admin.id,
    }
  });

  await (prisma as any).ticket.create({
    data: {
      title: 'Disputa de Espaço: Unidade Savassi',
      description: 'Conflito de reserva entre dois personals no mesmo horário.',
      status: 'OPEN',
      type: 'DISPUTE',
      city: 'Belo Horizonte',
      state: 'MG',
      reporterId: franchise.id,
    }
  });

  console.log('✅ Everos Fit: Banco de dados populado com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao rodar o Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });