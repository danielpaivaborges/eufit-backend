import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards 
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateProfessionalProfileDto } from './dto/create-professional-profile.dto';
import { CreateSpaceProfileDto } from './dto/create-space-profile.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ==============================================================================
  // 1. ROTAS PÚBLICAS (Cadastro)
  // ==============================================================================
  
  @Post()
  @ApiOperation({ summary: 'Cria um novo usuário (Aluno + Wallet)' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({ status: 409, description: 'Email ou CPF já cadastrado.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // ==============================================================================
  // 2. ROTAS PROTEGIDAS (Gestão de Perfis)
  // ==============================================================================

  @Post(':id/professional')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Transforma o usuário em Profissional (Cria Perfil)' })
  @ApiResponse({ status: 201, description: 'Perfil profissional criado.' })
  @ApiResponse({ status: 409, description: 'Usuário já é profissional.' })
  createProfessional(@Param('id') id: string, @Body() dto: CreateProfessionalProfileDto) {
    return this.usersService.createProfessionalProfile(id, dto);
  }

  @Post(':id/space')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Cadastra uma nova Academia/Espaço para o usuário' })
  @ApiResponse({ status: 201, description: 'Espaço e endereço criados com sucesso.' })
  createSpace(@Param('id') id: string, @Body() dto: CreateSpaceProfileDto) {
    return this.usersService.createSpaceProfile(id, dto);
  }

  // ==============================================================================
  // 3. ROTAS DE LEITURA E MANUTENÇÃO (Admin/User)
  // ==============================================================================

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Lista todos os usuários (Admin)' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Busca detalhes de um usuário específico (Com carteira e perfis)' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Atualiza dados básicos do usuário' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Remove um usuário e seus vínculos' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}