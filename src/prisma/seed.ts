import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 A Everos Fit: Iniciando Configuração de Teste (Nível Unicórnio)...');

  // 1. LIMPEZA TOTAL (Ordem correta para evitar erros de dependência)
  console.log('🧹 Limpando dados antigos...');
  await prisma.ticket.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.franchiseTerritory.deleteMany({});
  await prisma.franchiseeProfile.deleteMany({});
  await prisma.studentProfile.deleteMany({});
  
  await prisma.user.deleteMany({
    where: {
      email: { in: [
        'admin@everosfit.com', 
        'bh@everosfit.com', 
        'aluno_teste@everosfit.com'
      ] }
    }
  });

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash('mudar_depois', saltRounds);

  // 2. CRIAR ADMINISTRADOR GLOBAL
  console.log('👤 Criando Admin da Everos Fit...');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@everosfit.com',
      name: 'Daniel Admin',
      password: hashedPassword,
      phone: '5531999999999', 
      status: 'APPROVED',
      currentRole: 'ADMIN',
      adminProfile: { create: { level: 1 } }
    },
  });

  // 3. CRIAR FRANQUEADO E SEU PERFIL
  console.log('🏢 Criando Franqueado e Perfil Regional...');
  const franchiseUser = await prisma.user.create({
    data: {
      email: 'bh@everosfit.com',
      name: 'Franquia Everos BH',
      password: hashedPassword,
      phone: '5531988887777',
      status: 'APPROVED',
      currentRole: 'FRANCHISEE',
      franchiseeProfile: {
        create: { cnpj: '00.000.000/0001-00' }
      }
    },
    include: { franchiseeProfile: true }
  });

  // 4. CONFIGURAR TERRITÓRIO (Roteamento BH)
  console.log('📍 Mapeando Território: Belo Horizonte/MG...');
  await prisma.franchiseTerritory.create({
    data: {
      city: 'Belo Horizonte',
      state: 'MG',
      franchiseeId: franchiseUser.franchiseeProfile?.id,
      tier: 'TIER_4_METROPOLIS'
    }
  });

  // 5. CRIAR USUÁRIO "LEAD" (ETAPA 1 CONCLUÍDA)
  console.log('🎓 Criando Aluno de Teste (Status: INCOMPLETE)...');
  const student = await prisma.user.create({
    data: {
      email: 'aluno_teste@everosfit.com',
      name: 'Daniel Aluno Teste',
      password: hashedPassword,
      phone: '5531977776666',
      status: 'INCOMPLETE', // Iniciando na Etapa 1
      currentRole: 'STUDENT',
      studentProfile: {
        create: { referralCode: 'TESTE-BH' }
      },
      addresses: {
        create: {
          label: 'Principal',
          street: 'Praça da Liberdade',
          number: '100',
          district: 'Funcionários',
          city: 'Belo Horizonte', // Cidade mapeada para o franqueado acima
          state: 'MG',
          zipCode: '30140-010'
        }
      }
    }
  });

  console.log('✅ A Everos Fit: Ambiente de roteamento regional pronto!');
  console.log(`💡 Use o ID: ${student.id} para simular o envio da Etapa 2.`);
}

main()
  .catch((e) => {
    console.error('❌ Erro crítico no Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });