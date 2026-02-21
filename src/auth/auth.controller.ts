import { Controller, Post, Body, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CompleteRegistrationDto } from './dto/complete-registration.dto'; // DTO que criaremos a seguir
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('auth') 
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  @Patch('complete-registration')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Completa a segunda etapa do cadastro (CPF, Filiação, Nível Fitness)' })
  @ApiResponse({ status: 200, description: 'Dados enviados para análise da Everos Fit.' })
  @ApiResponse({ status: 400, description: 'Dados de validação incorretos.' })
  @ApiBody({ type: CompleteRegistrationDto })
  async completeRegistration(@Body() completeRegistrationDto: CompleteRegistrationDto) {
    // No fluxo real, o ID do usuário será extraído do JWT via Decorator
    return this.authService.completeRegistration(completeRegistrationDto);
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