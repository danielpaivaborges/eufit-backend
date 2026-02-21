import { Controller, Get, Post, Body, Patch, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
// IMPORTANTE: Importe o seu AuthGuard (ex: JwtAuthGuard). Aqui estou usando um nome genérico.
// import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 

@ApiTags('Tickets & Suporte')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard) // Descomente quando plugar na sua autenticação
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @ApiOperation({ summary: 'Abre um novo ticket de suporte, denúncia ou disputa' })
  @ApiResponse({ status: 201, description: 'Ticket criado com sucesso.' })
  create(@Request() req, @Body() createTicketDto: CreateTicketDto) {
    // Pega o ID do usuário logado através do token (req.user.id)
    const userId = req.user?.sub || req.user?.id || 'id-temporario-para-teste'; 
    return this.ticketsService.create(userId, createTicketDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os tickets (Uso exclusivo do Admin)' })
  @ApiResponse({ status: 200, description: 'Lista de tickets retornada com sucesso.' })
  findAll() {
    return this.ticketsService.findAll();
  }

  @Get('territory')
  @ApiOperation({ summary: 'Lista tickets por território (Uso do Franqueado)' })
  @ApiQuery({ name: 'city', required: true, description: 'Cidade da franquia' })
  @ApiQuery({ name: 'state', required: true, description: 'Estado (UF) da franquia' })
  @ApiResponse({ status: 200, description: 'Tickets da região retornados com sucesso.' })
  findByTerritory(@Query('city') city: string, @Query('state') state: string) {
    return this.ticketsService.findByTerritory(city, state);
  }

  @Get('my-tickets')
  @ApiOperation({ summary: 'Lista os tickets abertos pelo usuário logado' })
  @ApiResponse({ status: 200, description: 'Retorna o histórico de suporte do usuário.' })
  findMyTickets(@Request() req) {
    const userId = req.user?.sub || req.user?.id || 'id-temporario-para-teste';
    return this.ticketsService.findMyTickets(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca os detalhes de um ticket específico' })
  @ApiResponse({ status: 200, description: 'Dados do ticket retornados com sucesso.' })
  @ApiResponse({ status: 404, description: 'Ticket não encontrado.' })
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza status e resolução de um ticket (Admin/Franqueado)' })
  @ApiResponse({ status: 200, description: 'Ticket atualizado com sucesso.' })
  update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return this.ticketsService.update(id, updateTicketDto);
  }
}