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
import { CompleteRegistrationDto } from './dto/complete-registration.dto'; // Importado conforme planejado
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, phone, email, password } = registerDto;

    if (!phone) {
      throw new BadRequestException('O número de telefone é obrigatório.');
    }

    const userExists = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (userExists) {
      throw new ConflictException('Este número de telefone já está cadastrado.');
    }

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

      // A Everos Fit: Cadastro começa como INCOMPLETE agora
      const user = await this.prisma.user.create({
        data: {
          name,
          phone,
          email: email || null,
          password: hashedPassword,
          status: 'INCOMPLETE', 
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
        'Erro ao criar usuário no banco de dados da Everos Fit.',
      );
    }
  }

  // --- NOVA LÓGICA: COMPLEMENTAÇÃO DE CADASTRO (ETAPA 2) ---

  async completeRegistration(dto: CompleteRegistrationDto) {
    const { cpf, motherName, fatherName, fitnessLevel, documentFrontUrl, documentBackUrl, selfieUrl, userId } = dto;

    // 1. Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { addresses: true }
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado na Everos Fit.');
    }

    // 2. Roteamento Inteligente: Franqueado vs Admin
    // Buscamos o endereço ativo (Etapa 1) para definir quem analisa
    const userAddress = user.addresses.find(addr => addr.active);
    let assignedToFranchiseId: string | null = null;

    if (userAddress) {
      const territory = await this.prisma.franchiseTerritory.findFirst({
        where: {
          city: userAddress.city,
          state: userAddress.state,
          active: true
        }
      });
      assignedToFranchiseId = territory?.franchiseeId || null;
    }

    // 3. Atualizar dados e mudar status para EM ANÁLISE
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          cpf,
          motherName,
          fatherName,
          fitnessLevel,
          documentFrontUrl,
          documentBackUrl,
          selfieUrl,
          status: 'UNDER_REVIEW', // Transição de estado conforme briefing
        }
      });

      console.log(`[ROTEAMENTO] Cadastro de ${updatedUser.name} enviado para: ${assignedToFranchiseId ? 'Franqueado ' + assignedToFranchiseId : 'Admin Global'}`);

      return {
        message: 'Dados enviados com sucesso! Sua análise será concluída em até 48h.',
        status: updatedUser.status,
        analystType: assignedToFranchiseId ? 'FRANCHISEE' : 'ADMIN'
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Este CPF já está sendo utilizado por outro usuário.');
      }
      throw new InternalServerErrorException('Erro ao processar a complementação do cadastro.');
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

  async recoverPassword(phone: string) {
    const user = await this.prisma.user.findUnique({ where: { phone } });
    const recoveryCode = '1234'; 
    console.log(`[SIMULAÇÃO SMS] Código de recuperação para ${phone}: ${recoveryCode}`);

    return { 
      message: 'Se o número estiver cadastrado, o código foi enviado.',
      debug_code: recoveryCode 
    };
  }

  async resetPassword(phone: string, code: string, newPassword: string) {
    if (code !== '1234') {
      throw new BadRequestException('Código de verificação inválido ou expirado.');
    }

    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) {
        throw new NotFoundException('Usuário não encontrado.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await this.prisma.user.update({
      where: { phone },
      data: { password: hashedPassword },
    });

    return { message: 'Senha alterada com sucesso! Faça login.' };
  }
}