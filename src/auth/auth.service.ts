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

    // 1. Validar se o telefone foi enviado
    if (!phone) {
      throw new BadRequestException('O número de telefone é obrigatório.');
    }

    // 2. Verificar duplicidade de telefone
    const userExists = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (userExists) {
      throw new ConflictException('Este número de telefone já está cadastrado.');
    }

    // 3. Verificar duplicidade de e-mail (APENAS SE ELE FOR ENVIADO)
    if (email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email },
      });
      if (emailExists) {
        throw new ConflictException('Este e-mail já está em uso.');
      }
    }

    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 4. Criação Limpa: Sem gambiarras no e-mail
      const user = await this.prisma.user.create({
        data: {
          name,
          phone,
          email: email || null, // Agora o Prisma ACEITA null aqui!
          password: hashedPassword,
          status: 'ACTIVE',
          wallet: {
            create: { balanceAvailable: 0 },
          },
          studentProfile: {
            create: {
              referralCode: `FIT-${Math.random().toString(36).substring(7).toUpperCase()}`,
            },
          },
        },
        include: {
          wallet: true,
          studentProfile: true,
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