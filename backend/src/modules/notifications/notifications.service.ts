import { Injectable, Logger } from '@nestjs/common';
import { and, eq, isNull, asc } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { notifications } from '../../../drizzle/schema';
import { NotificationsGateway } from './notifications.gateway';
import type { InferInsertModel } from 'drizzle-orm';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly gateway: NotificationsGateway,
  ) {}

  async getForCustomer(customerId: number) {
    return this.drizzleService.db
      .select({
        id: notifications.id,
        type: notifications.type,
        title: notifications.title,
        message: notifications.message,
        isRead: notifications.isRead,
        linkUrl: notifications.linkUrl,
        createdAt: notifications.createdAt,
      })
      .from(notifications)
      .where(eq(notifications.targetCustomerId, customerId))
      .orderBy(asc(notifications.isRead), asc(notifications.createdAt));
  }

  async getUnreadCount(customerId: number) {
    const rows = await this.drizzleService.db
      .select({ count: notifications.id })
      .from(notifications)
      .where(
        and(
        eq(notifications.targetCustomerId, customerId),
        eq(notifications.isRead, false),
      ));
    return rows.length;
  }

  async markAsRead(notificationId: number) {
    await this.drizzleService.db
      .update(notifications)
      .set({ isRead: true, readAt: new Date().toISOString() })
      .where(eq(notifications.id, BigInt(notificationId)));
  }

  async create(data: {
    type: string;
    title: string;
    message: string;
    targetCustomerId: number;
    linkUrl?: string;
  }) {
    const inserted = await this.drizzleService.db
      .insert(notifications)
      .values({
        type: data.type as any,
        title: data.title,
        message: data.message,
        targetCustomerId: data.targetCustomerId,
        linkUrl: data.linkUrl ?? null,
        channel: 'IN_APP' as any,
        isRead: false,
      })
      .returning({ id: notifications.id });

    const notification = {
      id: Number(inserted[0].id),
      type: data.type,
      title: data.title,
      message: data.message,
      isRead: false,
      linkUrl: data.linkUrl,
      createdAt: new Date().toISOString(),
    };

    this.gateway.notifyCustomer(data.targetCustomerId, notification);
    return notification;
  }
}
