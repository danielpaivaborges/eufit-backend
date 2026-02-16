import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth') // Agrupa no Swagger
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('cadastro')
  @ApiOperation({ summary: 'Cria uma nova conta de usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'E-mail já cadastrado.' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Realiza login e retorna o token JWT' })
  @ApiResponse({ status: 200, description: 'Login bem-sucedido.' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
  async login(@Body() loginDto: any) { // Simplificado para o exemplo
    return this.authService.login(loginDto.email, loginDto.password);
  }
}