import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service.js';
import { SafeUserSelect } from '@/common/constants/user-select.constant.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: SafeUserSelect,
    });
    if (!user) throw new NotFoundException('User not found');
    return { data: user };
  }

  async findByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: SafeUserSelect,
    });
    if (!user) throw new NotFoundException('User not found');
    return { data: user };
  }

  async updateProfile(id: string, dto: { full_name?: string; avatar_url?: string }) {
    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
      select: SafeUserSelect,
    });
    return { data: user, message: 'Profile updated' };
  }
}
