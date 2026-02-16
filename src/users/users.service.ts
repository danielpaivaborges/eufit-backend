import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateProfessionalProfileDto } from './dto/create-professional-profile.dto';
import { CreateSpaceProfileDto } from './dto/create-space-profile.dto'; // <--- Importante
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserStatus } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // ==============================================================================
  // 1. CRIAÇÃO DE USUÁRIO (Fluxo de Cadastro / Sign Up)
  // ==============================================================================
  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: createUserDto.email },
          { cpf: createUserDto.cpf || undefined },
          { phone: createUserDto.phone || undefined },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === createUserDto.email) throw new ConflictException('E-mail já cadastrado.');
      if (createUserDto.cpf && existingUser.cpf === createUserDto.cpf) throw new ConflictException('CPF já cadastrado.');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const referralCode = (createUserDto.name.substring(0, 3) + randomBytes(2).toString('hex')).toUpperCase();

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          password: hashedPassword,
          cpf: createUserDto.cpf,
          phone: createUserDto.phone,
          status: UserStatus.ACTIVE,
        },
      });

      await tx.wallet.create({ data: { userId: user.id } });
      
      await tx.studentProfile.create({
        data: {
          userId: user.id,
          referralCode: referralCode,
        },
      });

      if (createUserDto.city && createUserDto.state) {
        await tx.address.create({
          data: {
            userId: user.id,
            label: 'Principal',
            street: 'Não informada',
            number: 'S/N',
            district: 'Centro',
            zipCode: '00000-000',
            city: createUserDto.city,
            state: createUserDto.state,
          },
        });
      }

      const { password, ...result } = user;
      return result;
    });
  }

  // ==============================================================================
  // 2. GESTÃO DE PERFIS (Transformar Usuário em Profissional)
  // ==============================================================================
  async createProfessionalProfile(userId: string, dto: CreateProfessionalProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado.');

    const existingProfile = await this.prisma.professionalProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) throw new ConflictException('Este usuário já possui um perfil profissional.');

    return this.prisma.professionalProfile.create({
      data: {
        userId: userId,
        type: dto.type,
        documentNumber: dto.documentNumber,
        documentType: 'CREF',
        bio: dto.bio,
        specialties: dto.specialties,
        radiusKm: 10,
        rating: 5.0,
        attendsGym: true,
      },
    });
  }

  // ==============================================================================
  // 3. GESTÃO DE ESPAÇOS (Academias)
  // ==============================================================================
  async createSpaceProfile(userId: string, dto: CreateSpaceProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado.');

    return this.prisma.spaceProfile.create({
      data: {
        userId: userId,
        name: dto.name,
        type: dto.type,
        cnpj: dto.cnpj,
        description: dto.description,
        addresses: {
          create: {
            label: 'Sede',
            street: dto.street,
            number: dto.number,
            district: dto.district,
            city: dto.city,
            state: dto.state,
            zipCode: dto.zipCode,
            userId: userId,
            active: true
          }
        }
      },
      include: {
        addresses: true
      }
    });
  }

  // ==============================================================================
  // 4. LEITURA (Buscas)
  // ==============================================================================
  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        currentRole: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        wallet: true,
        studentProfile: true,
        professionalProfile: true,
        spaceProfiles: true, // Inclui as academias do usuário
        addresses: true,
      },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado.');
    const { password, ...result } = user;
    return result;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: true,
        professionalProfile: true,
      }
    });
  }

  // ==============================================================================
  // 5. ATUALIZAÇÃO E REMOÇÃO
  // ==============================================================================
  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado.');

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    const { password, ...result } = updatedUser;
    return result;
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado.');

    return this.prisma.user.delete({ where: { id } });
  }
}