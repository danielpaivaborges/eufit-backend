import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
  BadRequestException,
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

    // 1. Verificar se o telefone já está em uso
    const userExists = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (userExists) {
      throw new ConflictException('Este número de telefone já está cadastrado.');
    }

    try {
      // 2. Criptografar a senha
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 3. Criar o usuário e estruturas relacionadas
      // CORREÇÃO TS2322: Se email for undefined/null, mandamos uma string vazia ou temp
      // porque seu schema exige String (não aceita null).
      const user = await this.prisma.user.create({
        data: {
          name,
          phone,
          email: email || `${phone}@eufit.temp`, 
          password: hashedPassword,
          status: 'ACTIVE',
          wallet: {
            create: {
              balanceAvailable: 0,
            },
          },
          studentProfile: {
            create: {
              referralCode: `FIT-${Math.random().toString(36).substring(7).toUpperCase()}`,
            },
          },
        },
      });

      return {
        id: user.id,
        name: user.name,
        phone: user.phone,
        status: user.status,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Erro ao criar usuário no banco de dados.',
      );
    }
  }

  async login(loginDto: LoginDto) {
    const { phone, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      throw new UnauthorizedException('Telefone ou senha incorretos.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Telefone ou senha incorretos.');
    }

    const payload = {
      sub: user.id,
      phone: user.phone,
      role: user.currentRole,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.currentRole,
        status: user.status,
      },
    };
  }
}