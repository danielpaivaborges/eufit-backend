import { Controller, Post, Body, HttpCode, HttpStatus, Patch, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; 
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service'; 
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CompleteRegistrationDto } from './dto/complete-registration.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('auth') 
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService 
  ) {}

  @Post('cadastro')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(AuthGuard('jwt')) 
  @ApiBearerAuth()
  @Patch('complete-registration')
  @HttpCode(HttpStatus.OK)
  async completeRegistration(
    @Request() req, 
    @Body() body: CompleteRegistrationDto 
  ) {
    console.log('--- REQUISIÇÃO RECEBIDA: ETAPA 2 ---');
    const userId = req.user?.sub || req.user?.userId || req.user?.id; 

    if (!userId) {
      throw new UnauthorizedException('Usuário não identificado.');
    }

    return this.usersService.completeRegistration(
      userId,
      body.cpf,
      body.fatherName || '',
      body.motherName,
      body.fitnessLevel
    );
  }

  @Post('recover')
  async recoverPassword(@Body() body: { phone: string }) {
    return this.authService.recoverPassword(body.phone);
  }

  @Post('reset')
  async resetPassword(@Body() body: { phone: string; code: string; newPassword: string }) {
    return this.authService.resetPassword(body.phone, body.code, body.newPassword);
  }
}