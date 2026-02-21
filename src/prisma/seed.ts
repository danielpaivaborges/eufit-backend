import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando Seed...');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@eufit.com' },
    update: {},
    create: {
      email: 'admin@eufit.com',
      name: 'Daniel Admin',
      password: 'senha_provisoria',
      phone: '31999999999',
      currentRole: 'ADMIN',
    },
  });

  // Criando um por um para evitar erro de modelo não carregado no createMany
  await (prisma as any).ticket.create({
    data: {
      title: 'Problema no pagamento',
      description: 'O aluno tentou pagar via PIX e não processou.',
      status: 'OPEN',
      type: 'SUPPORT',
      reporterId: admin.id,
    }
  });

  console.log('✅ Seed finalizado com sucesso!');
}

main().catch(console.error).finally(() => prisma.$disconnect());