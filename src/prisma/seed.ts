import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 A Everos Fit: Iniciando Reset de Segurança Definitivo...');

  // 1. LIMPEZA TOTAL (Ordem correta para evitar erro de Foreign Key)
  console.log('🧹 Limpando tabelas de suporte e disputa...');
  await prisma.ticket.deleteMany({}); // Apaga todos os tickets primeiro

  console.log('🧹 Removendo usuários de teste antigos...');
  await prisma.user.deleteMany({
    where: {
      email: { in: ['admin@everosfit.com', 'bh@everosfit.com', 'admin@eufit.com', 'bh@eufit.com'] }
    }
  });

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash('mudar_depois', saltRounds);

  // 2. CRIAR ADMINISTRADOR
  console.log('👤 Criando Admin da Everos Fit...');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@everosfit.com',
      name: 'Daniel Admin',
      password: hashedPassword,
      phone: '5531999999999', 
      status: 'APPROVED', // Atualizado para o novo Enum do schema
      currentRole: 'ADMIN',
    },
  });

  // 3. CRIAR FRANQUEADO
  console.log('🏢 Criando Franqueado da Everos Fit...');
  const franchise = await prisma.user.create({
    data: {
      email: 'bh@everosfit.com',
      name: 'Franquia Everos BH',
      password: hashedPassword,
      phone: '5531988887777',
      status: 'APPROVED', // Atualizado para o novo Enum do schema
      currentRole: 'FRANCHISEE',
    },
  });

  // 4. CRIAR TICKETS INICIAIS
  console.log('🎫 Gerando novos tickets de disputa...');
  await prisma.ticket.create({
    data: {
      title: 'Disputa de Espaço: Everos Savassi',
      description: 'Dois profissionais reservaram o mesmo ambiente.',
      status: 'OPEN',
      type: 'DISPUTE',
      city: 'Belo Horizonte',
      state: 'MG',
      reporterId: franchise.id,
    }
  });

  console.log('✅ A Everos Fit: Sistema limpo e usuários prontos para login!');
}

main()
  .catch((e) => {
    console.error('❌ Erro crítico no Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });