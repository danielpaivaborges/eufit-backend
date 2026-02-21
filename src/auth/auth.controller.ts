import { Controller, Post, Body, HttpCode, HttpStatus, Patch, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; 
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service'; 
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CompleteRegistrationDto } from './dto/complete-registration.dto'; // Importação do novo DTO
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('auth') 
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService 
  ) {}

  @Post('cadastro')
  @ApiOperation({ summary: 'Realiza o cadastro inicial (Etapa 1) de um novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou e-mail/telefone já em uso.' })
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autentica o usuário e retorna o token JWT' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Telefone ou senha incorretos.' })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // --- NOVA ROTA: SEGUNDA ETAPA DO FLUXO DE CADASTRO ---

  @UseGuards(AuthGuard('jwt')) 
  @ApiBearerAuth()
  @Patch('complete-registration')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Completa a segunda etapa do cadastro (CPF, Filiação, Nível Fitness)' })
  @ApiResponse({ status: 200, description: 'Dados enviados para análise da Everos Fit.' })
  @ApiResponse({ status: 400, description: 'Dados de validação incorretos.' })
  @ApiBody({ type: CompleteRegistrationDto })
  async completeRegistration(
    @Request() req, 
    @Body() body: CompleteRegistrationDto // Tipagem corrigida para o DTO
  ) {
    // 1. LOG DE SEGURANÇA: Ver o que chegou de fato
    console.log('--- NOVA TENTATIVA DE REGISTRO (ETAPA 2) ---');
    console.log('ID do Usuário logado:', req.user?.sub || req.user?.userId);

    // 2. Extrai o ID do Token JWT
    const userId = req.user?.sub || req.user?.userId || req.user?.id; 

    if (!userId) {
      console.error('ERRO CRÍTICO: Token não contém identificação do usuário.');
      throw new UnauthorizedException('Usuário não identificado. Faça login novamente.');
    }

    // 3. Passa para o Serviço processar e injetar as fotos de teste
    return this.usersService.completeRegistration(
      userId,
      body.cpf,
      body.fatherName || '',
      body.motherName,
      body.fitnessLevel
    );
  }

  // --- ROTAS DE RECUPERAÇÃO ---

  @Post('recover')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicita código de recuperação de senha (Simulação SMS)' })
  @ApiResponse({ status: 200, description: 'Código enviado (simulado).' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        phone: { type: 'string', example: '5531999999999' }
      }
    }
  })
  async recoverPassword(@Body() body: { phone: string }) {
    return this.authService.recoverPassword(body.phone);
  }

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Troca a senha usando o código recebido' })
  @ApiResponse({ status: 200, description: 'Senha alterada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Código inválido.' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        phone: { type: 'string', example: '5531999999999' },
        code: { type: 'string', example: '1234' },
        newPassword: { type: 'string', example: 'novaSenha123' }
      }
    }
  })
  async resetPassword(@Body() body: { phone: string; code: string; newPassword: string }) {
    return this.authService.resetPassword(body.phone, body.code, body.newPassword);
  }
}