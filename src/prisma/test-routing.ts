import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function auditRouting() {
  console.log('🧪 A Everos Fit: Iniciando Auditoria de Roteamento Regional...');

  // 1. Localizar o Aluno de Teste que criamos no Seed
  const student = await prisma.user.findUnique({
    where: { email: 'aluno_teste@everosfit.com' },
    include: { addresses: true }
  });

  if (!student) {
    console.error('❌ Erro: Aluno de teste não encontrado. Rode o seed primeiro!');
    return;
  }

  console.log(`👤 Usuário: ${student.name}`);
  console.log(`📍 Localização Etapa 1: ${student.addresses[0]?.city} / ${student.addresses[0]?.state}`);

  // 2. Simular a Lógica de Roteamento que colocamos no AuthService
  const userAddress = student.addresses.find(addr => addr.active);
  let assignedAnalyst = 'ADMIN GLOBAL';

  if (userAddress) {
    const territory = await prisma.franchiseTerritory.findFirst({
      where: {
        city: userAddress.city,
        state: userAddress.state,
        active: true
      },
      include: {
        franchisee: { include: { user: true } }
      }
    });

    if (territory?.franchisee?.user) {
      assignedAnalyst = `FRANQUEADO: ${territory.franchisee.user.name} (${territory.city})`;
    }
  }

  console.log('--- RESULTADO DA AUDITORIA ---');
  if (assignedAnalyst.includes('FRANQUEADO')) {
    console.log(`✅ SUCESSO: O roteamento regional está funcionando!`);
    console.log(`🎯 Destino da Análise: ${assignedAnalyst}`);
  } else {
    console.log(`⚠️ ALERTA: O sistema não encontrou franqueado e enviaria para o ${assignedAnalyst}`);
  }
  console.log('------------------------------');

  // 3. Simular a transição de status da Etapa 2
  console.log('🔄 Simulando transição de status: INCOMPLETE -> UNDER_REVIEW...');
  await prisma.user.update({
    where: { id: student.id },
    data: { status: 'UNDER_REVIEW' }
  });
  console.log('🚀 Status atualizado com sucesso no banco de dados!');
}

auditRouting()
  .catch((e) => console.error('❌ Erro no teste:', e))
  .finally(async () => await prisma.$disconnect());