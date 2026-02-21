import { Injectable, NotFoundException } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service'; // Ajuste o caminho do seu PrismaService se necessário
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(reporterId: string, createTicketDto: CreateTicketDto) {
    return this.prisma.ticket.create({
      data: {
        ...createTicketDto,
        reporterId,
      },
    });
  }

  // Admin vê tudo
  async findAll() {
    return this.prisma.ticket.findMany({
      include: {
        reporter: { select: { name: true, email: true, phone: true } },
        reported: { select: { name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Franqueado vê só os da área dele
  async findByTerritory(city: string, state: string) {
    return this.prisma.ticket.findMany({
      where: {
        city,
        state,
      },
      include: {
        reporter: { select: { name: true, phone: true } },
        reported: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Aluno/Profissional vê os próprios tickets
  async findMyTickets(userId: string) {
    return this.prisma.ticket.findMany({
      where: { reporterId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        reporter: { select: { name: true, phone: true } },
        reported: { select: { name: true, phone: true } },
        booking: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket com ID ${id} não encontrado`);
    }

    return ticket;
  }

  async update(id: string, updateTicketDto: UpdateTicketDto) {
    await this.findOne(id); // Valida se existe

    const dataToUpdate: any = { ...updateTicketDto };
    
    // Se estiver marcando como resolvido, salva a data automaticamente
    if (updateTicketDto.status === 'RESOLVED' || updateTicketDto.status === 'CLOSED') {
      dataToUpdate.resolvedAt = new Date();
    }

    return this.prisma.ticket.update({
      where: { id },
      data: dataToUpdate,
    });
  }
}