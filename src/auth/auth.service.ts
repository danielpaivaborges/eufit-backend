import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, phone, email, password } = registerDto;

    const userExists = await this.prisma.user.findUnique({ where: { phone } });
    if (userExists) throw new ConflictException('Este telefone já está cadastrado.');

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await this.prisma.user.create({
        data: {
          name,
          phone,
          email: email || null,
          password: hashedPassword,
          status: 'INCOMPLETE' as any, 
          wallet: { create: { balanceAvailable: 0 } },
          studentProfile: {
            create: { referralCode: `FIT-${Math.random().toString(36).substring(7).toUpperCase()}` },
          },
        }
      });

      return { id: user.id, name: user.name, phone: user.phone, status: user.status };
    } catch (error) {
      throw new InternalServerErrorException('Erro ao criar usuário.');
    }
  }

  async login(loginDto: LoginDto) {
    const { phone, password } = loginDto;
    const user = await this.prisma.user.findUnique({ where: { phone } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Telefone ou senha incorretos.');
    }

    const payload = { sub: user.id, phone: user.phone, role: user.currentRole };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { id: user.id, name: user.name, phone: user.phone, role: user.currentRole, status: user.status },
    };
  }

  async recoverPassword(phone: string) {
    console.log(`[SIMULAÇÃO SMS] Código de recuperação para ${phone}: 1234`);
    return { message: 'Código de recuperação enviado.' };
  }

  async resetPassword(phone: string, code: string, newPassword: string) {
    if (code !== '1234') throw new BadRequestException('Código inválido.');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { phone }, data: { password: hashedPassword } });
    return { message: 'Senha alterada com sucesso!' };
  }
}