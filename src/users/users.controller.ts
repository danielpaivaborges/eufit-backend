import { Controller, Get, Query, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('pending')
  @ApiOperation({ summary: 'Listar todos os usuários em análise (Apenas Admin)' })
  @ApiResponse({ status: 200, description: 'Lista de usuários aguardando aprovação.' })
  async findPendingAll() {
    return this.usersService.findPendingAll();
  }

  @Get('pending/territory')
  @ApiOperation({ summary: 'Listar usuários em análise por território (Franqueados)' })
  @ApiQuery({ name: 'city', required: true })
  @ApiQuery({ name: 'state', required: true })
  async findPendingByTerritory(
    @Query('city') city: string,
    @Query('state') state: string,
  ) {
    return this.usersService.findPendingByTerritory(city, state);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Aprovar ou Rejeitar um cadastro (Admin/Franqueado)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'APPROVED' | 'REJECTED'; rejectionReason?: string; analystComment?: string },
  ) {
    return this.usersService.updateUserStatus(id, body.status, body.rejectionReason, body.analystComment);
  }
}