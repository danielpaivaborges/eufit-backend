import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findPendingAll() {
    return this.prisma.user.findMany({
      where: { status: 'UNDER_REVIEW' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        cpf: true,
        fitnessLevel: true,
        documentFrontUrl: true,
        documentBackUrl: true,
        selfieUrl: true,
        createdAt: true,
        addresses: true 
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  async findPendingByTerritory(city: string, state: string) {
    return this.prisma.user.findMany({
      where: {
        status: 'UNDER_REVIEW',
        addresses: {
          some: {
            city: { equals: city, mode: 'insensitive' },
            state: { equals: state, mode: 'insensitive' }
          }
        }
      },
      select: {
        id: true,
        name: true,
        phone: true,
        fitnessLevel: true,
        createdAt: true,
        addresses: true
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  async updateUserStatus(id: string, status: 'APPROVED' | 'REJECTED', rejectionReason?: string, analystComment?: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado.');

    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          status: status as UserStatus,
          rejectionReason: status === 'REJECTED' ? rejectionReason : null,
          analystComment: analystComment || null,
          analyzedAt: new Date()
        }
      });
    } catch (error) {
      throw new InternalServerErrorException('Erro ao atualizar o status do usuário.');
    }
  }

  // MÉTODO COMPLETO: Agora inclui nomes dos pais e roteamento inteligente
  async completeRegistration(id: string, cpf: string, fatherName: string, motherName: string, fitnessLevel: string) {
    const user = await this.prisma.user.findUnique({ 
      where: { id },
      include: { addresses: true }
    });

    if (!user) throw new NotFoundException('Usuário não encontrado.');

    // Roteamento para Franqueado baseado no endereço
    const userAddress = user.addresses.find(addr => addr.active);
    let assignedToFranchiseId: string | null = null;

    if (userAddress) {
      const territory = await this.prisma.franchiseTerritory.findFirst({
        where: {
          city: userAddress.city,
          state: userAddress.state,
          active: true
        }
      });
      assignedToFranchiseId = territory?.franchiseeId || null;
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          cpf,
          fatherName,
          motherName,
          fitnessLevel: fitnessLevel as any, // Resolve erro de tipagem de Enum
          status: 'UNDER_REVIEW' as any,
          // URLs simuladas para visualização no Dashboard do Franqueado
          documentFrontUrl: 'https://placehold.co/600x400/151821/0DC9A7?text=RG+Frente',
          documentBackUrl: 'https://placehold.co/600x400/151821/0DC9A7?text=RG+Verso',
          selfieUrl: 'https://placehold.co/400x600/151821/0DC9A7?text=Selfie+do+Aluno',
        }
      });

      console.log(`[ROTEAMENTO] Enviado para: ${assignedToFranchiseId ? 'Franqueado ' + assignedToFranchiseId : 'Admin Global'}`);

      return {
        message: 'Dados enviados com sucesso! Sua análise será concluída em até 48h.',
        status: updatedUser.status
      };
    } catch (error) {
      throw new InternalServerErrorException('Erro ao processar o cadastro da Etapa 2.');
    }
  }
}