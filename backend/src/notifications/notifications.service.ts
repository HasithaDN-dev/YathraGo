import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationsService {
	constructor(private prisma: PrismaService) {}

	async findAll() {
		return this.prisma.notification.findMany({ orderBy: { createdAt: 'desc' } });
	}

	async findOne(id: number) {
		return this.prisma.notification.findUnique({ where: { id } });
	}

	async create(data: any) {
		// data: { sender, message, type?, receiver?, receiverId? }
		const toCreate: any = {
			sender: data.sender,
			message: data.message,
			type: data.type ?? 'System',
			receiver: data.receiver ?? 'WEBUSER',
			receiverId: typeof data.receiverId === 'number' ? data.receiverId : undefined,
		};
		return this.prisma.notification.create({ data: toCreate });
	}

	async update(id: number, data: any) {
		try {
			return await this.prisma.notification.update({ where: { id }, data });
		} catch (err) {
			return null;
		}
	}

	async remove(id: number) {
		try {
			await this.prisma.notification.delete({ where: { id } });
			return true;
		} catch (err) {
			return false;
		}
	}
}
