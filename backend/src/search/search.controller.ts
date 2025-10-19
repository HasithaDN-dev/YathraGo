import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('search')
export class SearchController {
  constructor(private prisma: PrismaService) {}

  // GET /search?type=DRIVER|CUSTOMER|WEBUSER&q=term
  @Get()
  async search(@Query('type') type: string, @Query('q') q: string) {
    const term = (q || '').trim();
    if (!term) return [];

    const take = 10;

    if (type === 'DRIVER') {
      const rows = await this.prisma.driver.findMany({
        where: { name: { contains: term, mode: 'insensitive' } },
        select: { driver_id: true, name: true, phone: true, email: true },
        take,
      });
      return rows.map((r) => ({
        id: r.driver_id,
        name: r.name,
        phone: r.phone,
        email: r.email,
      }));
    }

    if (type === 'CUSTOMER') {
      const rows = await this.prisma.customer.findMany({
        where: {
          OR: [
            { firstName: { contains: term, mode: 'insensitive' } },
            { lastName: { contains: term, mode: 'insensitive' } },
            { phone: { contains: term } },
          ],
        },
        select: {
          customer_id: true,
          firstName: true,
          lastName: true,
          phone: true,
        },
        take,
      });
      return rows.map((r) => ({
        id: r.customer_id,
        name: `${r.firstName} ${r.lastName}`.trim(),
        phone: r.phone,
      }));
    }

    if (type === 'WEBUSER') {
      const rows = await this.prisma.webuser.findMany({
        where: { username: { contains: term, mode: 'insensitive' } },
        select: { id: true, username: true, email: true },
        take,
      });
      return rows.map((r) => ({ id: r.id, name: r.username, email: r.email }));
    }

    return [];
  }
}
