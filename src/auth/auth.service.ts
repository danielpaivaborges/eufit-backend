import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
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

  /**
   * Registra um novo usuário criando automaticamente:
   * 1. O registro de identidade (User)
   * 2. A carteira financeira (Wallet)
   * 3. O perfil de aluno (StudentProfile)
   */
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

      // 3. Criar o usuário e estruturas relacionadas (Transação atômica)
      const user = await this.prisma.user.create({
        data: {
          name,
          phone,
          email: email || null,
          password: hashedPassword,
          status: 'ACTIVE',
          // Criando carteira e perfil de aluno automaticamente seguindo seu schema
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
        include: {
          wallet: true,
          studentProfile: true,
        },
      });

      // Retorna o usuário sem a senha
      return {
        id: user.id,
        name: user.name,
        phone: user.phone,
        status: user.status,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Erro ao criar usuário no banco de dados.',
      );
    }
  }

  /**
   * Valida as credenciais (telefone e senha) e retorna o Token JWT
   */
  async login(loginDto: LoginDto) {
    const { phone, password } = loginDto;

    // 1. Buscar usuário pelo telefone
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      throw new UnauthorizedException('Telefone ou senha incorretos.');
    }

    // 2. Validar a senha criptografada
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Telefone ou senha incorretos.');
    }

    // 3. Gerar o Payload do JWT
    const payload = {
      sub: user.id,
      phone: user.phone,
      role: user.currentRole,
    };

    // 4. Retornar token e dados básicos do usuário
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