import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, HttpException, HttpStatus } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
	constructor(private readonly service: NotificationsService) {}

	@Get()
	async findAll() {
		return this.service.findAll();
	}

	@Get(':id')
	async findOne(@Param('id', ParseIntPipe) id: number) {
		const n = await this.service.findOne(id);
		if (!n) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		return n;
	}

	@Post()
	async create(@Body() body: any) {
		// expect { sender, message, type, receiver?, receiverId? }
		if (!body?.sender || !body?.message) {
			throw new HttpException('Missing sender or message', HttpStatus.BAD_REQUEST);
		}
		return this.service.create(body);
	}

	@Put(':id')
	async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
		const updated = await this.service.update(id, body);
		if (!updated) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		return updated;
	}

	@Delete(':id')
	async remove(@Param('id', ParseIntPipe) id: number) {
		const ok = await this.service.remove(id);
		if (!ok) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		return { success: true };
	}
}
