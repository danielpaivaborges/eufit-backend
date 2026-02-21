import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  // Agora aceita o userId vindo do Controller
  async create(userId: string, dto: CreateTicketDto) {
    return this.prisma.ticket.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        city: dto.city,
        state: dto.state,
        reporterId: userId, // Vincula o ticket ao usuário logado
      },
    });
  }

  async findAll() {
    return this.prisma.ticket.findMany({
      include: { reporter: { select: { name: true, phone: true } } },
    });
  }

  // Método que estava faltando!
  async findMyTickets(userId: string) {
    return this.prisma.ticket.findMany({
      where: { reporterId: userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findByTerritory(city: string, state: string) {
    return this.prisma.ticket.findMany({
      where: { city, state },
      include: { reporter: { select: { name: true, phone: true } } },
    });
  }

  async findOne(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });
    if (!ticket) throw new NotFoundException('Ticket não encontrado');
    return ticket;
  }

  async update(id: string, updateTicketDto: UpdateTicketDto) {
    return this.prisma.ticket.update({
      where: { id },
      data: updateTicketDto,
    });
  }
}