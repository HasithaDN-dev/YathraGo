import { Injectable, Logger } from '@nestjs/common';
import { admin } from './firebase.config';
import type { Message, MulticastMessage } from 'firebase-admin/messaging';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);

  /**
   * Send notification to a single device
   * @param token - FCM token of the device
   * @param title - Notification title
   * @param body - Notification body
   * @param data - Optional data payload
   */
  async sendToDevice(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    const message: Message = {
      notification: {
        title,
        body,
      },
      data,
      token,
    };

    try {
      const response = await admin.messaging().send(message);
      this.logger.log(`Successfully sent message: ${response}`);
      return response;
    } catch (error) {
      this.logger.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Send notification to multiple devices
   * @param tokens - Array of FCM tokens
   * @param title - Notification title
   * @param body - Notification body
   * @param data - Optional data payload
   */
  async sendToMultipleDevices(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    const message: MulticastMessage = {
      notification: {
        title,
        body,
      },
      data,
      tokens,
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      this.logger.log(
        `${response.successCount} messages were sent successfully`,
      );
      if (response.failureCount > 0) {
        this.logger.warn(`${response.failureCount} messages failed to send`);
      }
      return response;
    } catch (error) {
      this.logger.error('Error sending multicast message:', error);
      throw error;
    }
  }

  /**
   * Send notification to a topic
   * @param topic - Topic name (e.g., 'drivers', 'customers')
   * @param title - Notification title
   * @param body - Notification body
   * @param data - Optional data payload
   */
  async sendToTopic(
    topic: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    const message: Message = {
      notification: {
        title,
        body,
      },
      data,
      topic,
    };

    try {
      const response = await admin.messaging().send(message);
      this.logger.log(`Successfully sent message to topic: ${response}`);
      return response;
    } catch (error) {
      this.logger.error('Error sending message to topic:', error);
      throw error;
    }
  }

  /**
   * Subscribe a device to a topic
   * @param tokens - FCM token or array of tokens
   * @param topic - Topic name
   */
  async subscribeToTopic(tokens: string | string[], topic: string) {
    try {
      const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
      const response = await admin
        .messaging()
        .subscribeToTopic(tokenArray, topic);
      this.logger.log(
        `Successfully subscribed ${response.successCount} tokens to topic: ${topic}`,
      );
      return response;
    } catch (error) {
      this.logger.error('Error subscribing to topic:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe a device from a topic
   * @param tokens - FCM token or array of tokens
   * @param topic - Topic name
   */
  async unsubscribeFromTopic(tokens: string | string[], topic: string) {
    try {
      const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
      const response = await admin
        .messaging()
        .unsubscribeFromTopic(tokenArray, topic);
      this.logger.log(
        `Successfully unsubscribed ${response.successCount} tokens from topic: ${topic}`,
      );
      return response;
    } catch (error) {
      this.logger.error('Error unsubscribing from topic:', error);
      throw error;
    }
  }
}
