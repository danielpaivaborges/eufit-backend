import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Certifique-se de ter o PrismaService
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: RegisterDto) {
    // 1. Verificar se e-mail existe
    const userExists = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (userExists) throw new ConflictException('Este e-mail já está em uso');

    // 2. Criptografar senha
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 3. Criar usuário e sua Wallet inicial (baseado no seu schema)
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        wallet: { create: {} }, // Cria a carteira junto com o usuário
        studentProfile: { create: { referralCode: `REF-${Math.random().toString(36).substring(7).toUpperCase()}` } }
      },
    });

    return { id: user.id, email: user.email, name: user.name };
  }

  async login(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) throw new UnauthorizedException('Credenciais inválidas');

    const payload = { sub: user.id, email: user.email, role: user.currentRole };
    
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { id: user.id, name: user.name, role: user.currentRole }
    };
  }
}