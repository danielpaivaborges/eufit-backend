import { Controller, Get, Post, Body, Patch, Param, Req, UseGuards, Query } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Tickets & Suporte')
@ApiBearerAuth()
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo ticket ou disputa' })
  create(@Req() req: any, @Body() createTicketDto: CreateTicketDto) {
    // Pega o ID do usuário injetado pelo seu AuthGuard/Interceptor
    const userId = req.user.id; 
    return this.ticketsService.create(userId, createTicketDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os tickets (Admin)' })
  findAll() {
    return this.ticketsService.findAll();
  }

  @Get('my-tickets')
  @ApiOperation({ summary: 'Lista os tickets do usuário logado' })
  findMy(@Req() req: any) {
    const userId = req.user.id;
    return this.ticketsService.findMyTickets(userId);
  }

  @Get('territory')
  @ApiOperation({ summary: 'Lista tickets por região (Franqueado)' })
  findByTerritory(@Query('city') city: string, @Query('state') state: string) {
    return this.ticketsService.findByTerritory(city, state);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return this.ticketsService.update(id, updateTicketDto);
  }
}