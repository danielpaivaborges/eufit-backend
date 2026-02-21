import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Busca todos os usuários aguardando análise (Visão Admin Global)
   */
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
        addresses: true // Simplificado para ver todos os endereços vinculados
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  /**
   * Busca usuários em análise de um território específico (Visão Franqueado)
   * Agora ignora maiúsculas/minúsculas para evitar erros de digitação.
   */
  async findPendingByTerritory(city: string, state: string) {
    return this.prisma.user.findMany({
      where: {
        status: 'UNDER_REVIEW',
        addresses: {
          some: {
            city: {
              equals: city,
              mode: 'insensitive', // "Belo Horizonte" = "belo horizonte"
            },
            state: {
              equals: state,
              mode: 'insensitive',
            }
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

  /**
   * Aprova ou Rejeita o cadastro de um aluno
   */
  async updateUserStatus(
    id: string, 
    status: 'APPROVED' | 'REJECTED', 
    rejectionReason?: string, 
    analystComment?: string
  ) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado na Éveros Fit.');
    }

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

  /**
   * Completa o cadastro da Etapa 2 do Aluno e o envia para análise
   */
  async completeRegistration(
    id: string,
    cpf: string,
    fatherName: string,
    motherName: string,
    fitnessLevel: string
  ) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          cpf,
          // Convertendo o nível para o formato esperado pelo Prisma
          fitnessLevel: fitnessLevel as any, 
          // O MAIS IMPORTANTE: Muda o status para a fila de análise!
          status: 'UNDER_REVIEW',
          
          // URLs simuladas para testarmos a tela de detalhes do Franqueado
          documentFrontUrl: 'https://placehold.co/600x400/151821/0DC9A7?text=RG+Frente',
          documentBackUrl: 'https://placehold.co/600x400/151821/0DC9A7?text=RG+Verso',
          selfieUrl: 'https://placehold.co/400x600/151821/0DC9A7?text=Selfie+do+Aluno',
        }
      });
    } catch (error) {
      throw new InternalServerErrorException('Erro ao processar o cadastro da Etapa 2.');
    }
  }
}