import { Injectable, NotFoundException } from '@nestjs/common'; // Corrigido aqui
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { ApiTags } from '@nestjs/swagger';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async create(createTicketDto: CreateTicketDto) {
    return this.prisma.ticket.create({
      data: createTicketDto,
    });
  }

  async findAll() {
    return this.prisma.ticket.findMany({
      include: { reporter: { select: { name: true, phone: true } } },
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